using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataCleanupProj
{
    class FilterDataByDay
    {
        public int dayOfYear { get; set; }

        public Wind wind { get; set; }

        public Pressure pressure { get; set; }

        public int numberOfSamples { get; set; }

        public FilterDataByDay()
        {
            wind = new Wind();
            pressure = new Pressure();
        }
    }
}
