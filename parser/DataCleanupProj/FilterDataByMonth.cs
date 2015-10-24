using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataCleanupProj
{
    class FilterDataByMonth
    {
        public int month { get; set; }

        public List<FilteredData> data { get; set; }

        public FilterDataByMonth()
        {
            data = new List<FilteredData>();
        }
    }
}
