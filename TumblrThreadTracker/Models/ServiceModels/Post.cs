﻿using System;
using System.Collections.Generic;
using System.Linq;
using TumblrThreadTracker.Interfaces;
using TumblrThreadTracker.Models.DomainModels;

namespace TumblrThreadTracker.Models.ServiceModels
{
    public class Post : ServiceModel, IPost
    {
        public string blog_name { get; set; }
        public long id { get; set; }
        public string post_url { get; set; }
        public string type { get; set; }
        public long timestamp { get; set; }
        public string date { get; set; }
        public string format { get; set; }
        public string reblog_key { get; set; }
        public List<string> tags { get; set; }
        public bool bookmarklet { get; set; }
        public bool mobile { get; set; }
        public string source_url { get; set; }
        public string source_title { get; set; }
        public string title { get; set; }
        public bool liked { get; set; }
        public string state { get; set; }
        public long total_posts { get; set; }
        public List<Note> notes { get; set; }

        public Note GetMostRecentRelevantNote(string blogShortname, string watchedShortname)
        {
            Note mostRecentRelevantNote;
            if (string.IsNullOrEmpty(watchedShortname))
                mostRecentRelevantNote =
                    notes.OrderByDescending(n => n.timestamp)
                        .FirstOrDefault(n => n.type == "reblog");
            else
                mostRecentRelevantNote =
                    notes.OrderByDescending(n => n.timestamp)
                        .FirstOrDefault(
                            n => n.type == "reblog" 
                            && (
                                String.Equals(n.blog_name, watchedShortname, StringComparison.OrdinalIgnoreCase) 
                                    || String.Equals(n.blog_name, blogShortname, StringComparison.OrdinalIgnoreCase)
                               )
                        );

            return mostRecentRelevantNote;
        }
    }
}