using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataCleanupProj
{
    class Properties
    {
        public string id { get; set; }

        public string basin { get; set; }

        public string name { get; set; }

        public TimeStamp timestamp { get; set; }

        public float maxwind { get; set; }

        public float minpressure { get; set; }

        public string latitude { get; set; }

        public string longitude { get; set; }

        public string l { get; set; }

        public string ts { get; set; }

        public Quarter q34 { get; set; }

        public Quarter q50 { get; set; }

        public Quarter q64 { get; set; }

        public Properties()
        {
            timestamp = new TimeStamp();
            q34 = new Quarter();
            q50 = new Quarter();
            q64 = new Quarter();
        }
    }
}
