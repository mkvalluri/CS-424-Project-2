using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text.RegularExpressions;

namespace DataCleanupProj
{   
    class Program
    {
        static string finalData = "";
        static void Main(string[] args)
        {
            var data = File.ReadAllLines(@"D:\Projects\hurdat2-1851-2014-060415.txt");
            var data2 = File.ReadAllLines(@"D:\Projects\hurdat2-nencpac-1949-2014-092515.txt");
            ConstructJSONObj(data);
            ConstructJSONObj(data2);
            File.WriteAllText(@"D:\Projects\data.json", finalData);
            Console.ReadLine();
        }

        static void ConstructJSONObj(string[] data)
        {
            List<Feature> features = new List<Feature>();
            string name = "";
            string basin = "";
            string id = "";
            foreach (var line in data)
            {
                Feature tempFeature = new Feature();
                var tempLines = line.Split(new char[] { ',' });
                if (Regex.IsMatch(line, @"^\d"))
                {
                    tempFeature.properties.name = name;
                    tempFeature.properties.id = id;
                    tempFeature.properties.basin = basin;
                    tempFeature.type = "Feature";
                    tempFeature.properties.timestamp = GetTimeStamp(tempLines[0] + tempLines[1]);
                    tempFeature.properties.l = tempLines[2].Trim();
                    tempFeature.properties.ts = tempLines[3].Trim();
                    tempFeature.properties.latitude = tempLines[4].Trim();
                    tempFeature.properties.longitude = tempLines[5].Trim();
                    tempFeature.geometry.type = "Point";
                    string l = tempLines[5].Substring(0, tempLines[5].Length - 1).Trim();
                    string k = tempLines[4].Substring(0, tempLines[4].Length - 1).Trim();
                    tempFeature.geometry.coordinates = new Decimal[] { Convert.ToDecimal(l) * -1, Convert.ToDecimal(k) };
                    tempFeature.properties.maxwind = Convert.ToInt64(tempLines[6].Trim());
                    tempFeature.properties.minpressure = Convert.ToInt64(tempLines[7].Trim());
                    tempFeature.properties.q34 = GetQuarter(tempLines[8].Trim(), tempLines[9].Trim(), tempLines[10].Trim(), tempLines[11].Trim());
                    tempFeature.properties.q50 = GetQuarter(tempLines[12].Trim(), tempLines[13].Trim(), tempLines[14].Trim(), tempLines[15].Trim());
                    tempFeature.properties.q64 = GetQuarter(tempLines[16].Trim(), tempLines[17].Trim(), tempLines[18].Trim(), tempLines[19].Trim());
                    features.Add(tempFeature);
                }
                else
                {
                    name = tempLines[1].Trim();
                    id = tempLines[0].Trim();
                    basin = tempLines[0].Trim().Substring(0, 2);
                }
            }
            finalData += JsonConvert.SerializeObject(features);
        }

        static TimeStamp GetTimeStamp(string line)
        {
            TimeStamp t = new TimeStamp();
            t.year = Convert.ToInt32(line.Substring(0, 4));
            t.month = Convert.ToInt32(line.Substring(4, 2));
            t.day = Convert.ToInt32(line.Substring(6, 2));
            t.hour = Convert.ToInt32(line.Substring(8, 2));
            t.minute = Convert.ToInt32(line.Substring(10, 2));
            return t;
        }

        static Quarter GetQuarter(string ne, string se, string sw, string nw)
        {
            Quarter q = new Quarter();
            q.ne = Convert.ToInt64(ne);
            q.se = Convert.ToInt64(se);
            q.sw = Convert.ToInt64(sw);
            q.nw = Convert.ToInt64(nw);
            return q;
        }
    }
}
