using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataCleanupProj
{
    class FilterDataByDay
    {
        public string date { get; set; }

        public double windMin { get; set; }

        public double windMax { get; set; }

        public double windAvg { get; set; }

        public double pressureMin { get; set; }

        public double pressureMax { get; set; }

        public double pressureAvg { get; set; }

        public int numberOfSamples { get; set; }
    
    }
}
