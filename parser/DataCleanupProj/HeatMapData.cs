using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataCleanupProj
{
    class HeatMapData
    {
        public List<Line> Square { get; set; }

        public int Count { get; set; }

        public HeatMapData()
        {
            Square = new List<Line>();
        }
    }

    class Point
    {
        public double x { get; set; }

        public double y { get; set; }

        public Point(double X, double Y)
        {
            x = X;
            y = Y;
        }
    }

    class Line
    {
        public List<Point> line { get; set; }

        public Line()
        {
            line = new List<Point>();
        }
    }

    class TempClass
    {
        public double lat { get; set; }

        public double lon { get; set; }
    }
}
