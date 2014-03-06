﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace TumblrThreadTracker.Models.Service_Models
{
    public class Blog
    {
        public string title { get; set; }
        public long posts { get; set; }
        public string name { get; set; }
        public long updated { get; set; }
        public string description { get; set; }
        public bool ask { get; set; }
        public bool ask_anon { get; set; }
        public long likes { get; set; }
    }
}