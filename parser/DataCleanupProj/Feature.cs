using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataCleanupProj
{
    class Feature
    {
        public string type { get; set; }

        public Geometry geometry { get; set; }

        public Properties properties { get; set; }

        public Feature()
        {
            geometry = new Geometry();
            properties = new Properties();
        }

    }
}
