using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataCleanupProj
{
    class FilteredData
    {
        public string name { get; set; }

        public string id { get; set; }

        public int year { get; set; }

        public Wind wind { get; set; }

        public Pressure pressure { get; set; }

        public FilteredData()
        {
            wind = new Wind();

            pressure = new Pressure();
        }
    }

    class Wind
    {
        public float min { get; set; }

        public float max { get; set; }

        public float avg { get; set; }
    }

    class Pressure
    {
        public float min { get; set; }

        public float max { get; set; }

        public float avg { get; set; }
    }
}
