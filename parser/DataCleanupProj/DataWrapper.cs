using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataCleanupProj
{
    class DataWrapper
    {
        public string type { get; set; }

        public CRS crs { get; set; }

        public List<Feature> features { get; set; }

        public DataWrapper()
        {
            features = new List<Feature>();
            crs = new CRS();
            type = "FeatureCollection";
        }
    }
}
