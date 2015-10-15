using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataCleanupProj
{
    class CRS
    {
        public string type { get; set; }

        public Properties properties { get; set; }

        public CRS()
        {
            properties = new Properties();
            properties.name = "urn:ogc:def:crs:OFC:1.3:CRS84";
            type = "name";
        }

    }
}
