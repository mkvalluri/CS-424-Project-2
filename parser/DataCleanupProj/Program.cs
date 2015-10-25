using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text.RegularExpressions;

namespace DataCleanupProj
{   
    class Program
    {
        static List<FilteredData> filteredData;

        static List<FilteredData> filteredDataByMonth;
        static List<FilterDataByMonth> filterDataByMonth;

        static List<FilteredData> filteredDataByDay;
        static List<FilterDataByDay> filterDataByDay;

        static List<HurricaneName> hurricaneNames;

        static void Main(string[] args)
        {
            DataWrapper outputData = new DataWrapper();
            string finalData = "";
            filteredData = new List<FilteredData>();
            filteredDataByMonth = new List<FilteredData>();
            filteredDataByDay = new List<FilteredData>();
            hurricaneNames = new List<HurricaneName>();
            filterDataByMonth = new List<FilterDataByMonth>();
            filterDataByDay = new List<FilterDataByDay>();

            var data = File.ReadAllLines(@"D:\Projects\hurdat2-1851-2014-060415.txt");
            var data2 = File.ReadAllLines(@"D:\Projects\hurdat2-nencpac-1949-2014-092515.txt");
            outputData.features.AddRange(ConstructJSONObj(data));
            outputData.features.AddRange(ConstructJSONObj(data2));

            JsonSerializerSettings settings = new JsonSerializerSettings();
            settings.NullValueHandling = NullValueHandling.Ignore;

            finalData = JsonConvert.SerializeObject(outputData, settings);
            //File.WriteAllText(@"D:\Projects\data.json", finalData);

            finalData = JsonConvert.SerializeObject(filteredData, settings);
            //File.WriteAllText(@"D:\Projects\filteredData.json", finalData);

            finalData = JsonConvert.SerializeObject(hurricaneNames, settings);
            //File.WriteAllText(@"D:\Projects\hurricaneListNames.json", str);

            ConstructFinalObjectByMonth();
            finalData = JsonConvert.SerializeObject(filterDataByMonth, settings);
            //File.WriteAllText(@"D:\Projects\filteredDatav1.json", finalData);

            ConstructFinalObjectByDate();
            finalData = JsonConvert.SerializeObject(filterDataByDay, settings);
            File.WriteAllText(@"D:\Projects\filteredDatav2.json", finalData);

            Console.ReadLine();
        }

        static List<Feature> ConstructJSONObj(string[] data)
        {
            List<Feature> features = new List<Feature>();
            string name = "";
            string basin = "";
            string id = "";
            string land = "";
            int year = 0;
            List<int> month = new List<int>();
            List<int> day = new List<int>();
            FilteredData tempFilteredData;

            float wMin = 99999999.0f;
            float wMax = 0.0f;
            float wAvg = 0.0f;

            float pMin = 99999999.0f;
            float pMax = 0.0f;
            float pAvg = 0.0f;

            int countW = 0;
            int countP = 0;

            foreach (var line in data)
            {
                Feature tempFeature = new Feature();
                HurricaneName hurricaneName = new HurricaneName();
                var tempLines = line.Split(new char[] { ',' });
                if (Regex.IsMatch(line, @"^\d"))
                {
                    tempFeature.properties.name = name;
                    tempFeature.properties.id = id;
                    tempFeature.properties.basin = basin;
                    tempFeature.type = "Feature";
                    tempFeature.properties.timestamp = GetTimeStamp(tempLines[0] + tempLines[1]);
                    if (month.Count == 0)
                        month.Add(tempFeature.properties.timestamp.month);
                    else
                    {
                        if (!month.Exists(m => m == tempFeature.properties.timestamp.month))
                            month.Add(tempFeature.properties.timestamp.month);
                    }
                    if (day.Count == 0)
                        day.Add(tempFeature.properties.timestamp.day);
                    else
                    {
                        if(!day.Exists(d => d == tempFeature.properties.timestamp.day))
                        {
                            day.Add(tempFeature.properties.timestamp.day);
                        }
                    }
                    tempFeature.properties.l = tempLines[2].Trim();
                    tempFeature.properties.ts = tempLines[3].Trim();
                    tempFeature.properties.latitude = tempLines[4].Trim();
                    tempFeature.properties.longitude = tempLines[5].Trim();
                    tempFeature.geometry.type = "Point";
                    string l = tempLines[5].Substring(0, tempLines[5].Length - 1).Trim();
                    string k = tempLines[4].Substring(0, tempLines[4].Length - 1).Trim();
                    tempFeature.geometry.coordinates = new Decimal[] { Convert.ToDecimal(l) * -1, Convert.ToDecimal(k) };

                    tempFeature.properties.maxwind = Convert.ToInt64(tempLines[6].Trim()) == -99 ? 0 : Convert.ToInt64(tempLines[6].Trim());
                    if (wMax < tempFeature.properties.maxwind)
                        wMax = tempFeature.properties.maxwind;
                    if (wMin > tempFeature.properties.maxwind)
                        wMin = tempFeature.properties.maxwind;
                    if(Convert.ToInt64(tempLines[6].Trim()) != -99)
                    {
                        wAvg += tempFeature.properties.maxwind;
                        countW++;
                    }

                    tempFeature.properties.minpressure = Convert.ToInt64(tempLines[7].Trim()) == -999 ? 0 : Convert.ToInt64(tempLines[7].Trim());
                    if (pMax < tempFeature.properties.minpressure)
                        pMax = tempFeature.properties.minpressure;
                    if (pMin > tempFeature.properties.minpressure)
                        pMin = tempFeature.properties.minpressure;
                    if(Convert.ToInt64(tempLines[7].Trim()) != -999)
                    {
                        pAvg += tempFeature.properties.minpressure;
                        countP++;
                    }


                    tempFeature.properties.q34 = GetQuarter(tempLines[8].Trim(), tempLines[9].Trim(), tempLines[10].Trim(), tempLines[11].Trim());
                    tempFeature.properties.q50 = GetQuarter(tempLines[12].Trim(), tempLines[13].Trim(), tempLines[14].Trim(), tempLines[15].Trim());
                    tempFeature.properties.q64 = GetQuarter(tempLines[16].Trim(), tempLines[17].Trim(), tempLines[18].Trim(), tempLines[19].Trim());
                    features.Add(tempFeature);
                }
                else
                {
                    if(countW > 0 || countP > 0)
                    {
                        hurricaneName.Name = name + " - " + year;
                        hurricaneName.Id = id;
                        hurricaneName.TimeStamp = year.ToString();
                        hurricaneNames.Add(hurricaneName);

                        wAvg /= countW;
                        pAvg /= countP;

                        tempFilteredData = new FilteredData();
                        tempFilteredData.name = name;
                        tempFilteredData.id = id;
                        tempFilteredData.year = year;
                        tempFilteredData.basin = basin;
                        tempFilteredData.wind.avg = wAvg;
                        tempFilteredData.wind.max = wMax;
                        tempFilteredData.wind.min = wMin;
                        tempFilteredData.pressure.avg = pAvg;
                        tempFilteredData.pressure.min = pMin;
                        tempFilteredData.pressure.max = pMax;
                        filteredData.Add(tempFilteredData);

                        foreach (var m in month)
                        {
                            tempFilteredData.month = m;
                            if(!filteredDataByMonth.Exists(f => f.id == tempFilteredData.id && f.month == tempFilteredData.month))
                                filteredDataByMonth.Add(tempFilteredData);

                            foreach(var d in day)
                            {
                                tempFilteredData.day = d;
                                if(!filteredDataByDay.Exists(f => f.id == tempFilteredData.id && f.month == tempFilteredData.month && f.day == tempFilteredData.day))
                                {
                                    filteredDataByDay.Add(tempFilteredData);
                                }

                            }
                        }

                        countW = 0;
                        countP = 0;
                        pMin = wMin = 9999999.0f;
                        pMax = wMax = 0.0f;
                        pAvg = wAvg = 0.0f;
                    }
                    name = tempLines[1].Trim();
                    id = tempLines[0].Trim();
                    basin = tempLines[0].Trim().Substring(0, 2);
                    year = Convert.ToInt32(tempLines[0].Trim().Substring(4, 4));
                    month = new List<int>();
                    day = new List<int>();
                    
                }
            }
            //finalData += JsonConvert.SerializeObject(features);
            return features;
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
            q.ne = Convert.ToInt64(ne) == -999 ? 0 : Convert.ToInt64(ne);
            q.se = Convert.ToInt64(se) == -999 ? 0 : Convert.ToInt64(se);
            q.sw = Convert.ToInt64(sw) == -999 ? 0 : Convert.ToInt64(sw);
            q.nw = Convert.ToInt64(nw) == -999 ? 0 : Convert.ToInt64(nw);
            return q;
        }

        static void ConstructFinalObjectByMonth()
        {
            for(int i = 1; i < 13; i++)
            {
                FilterDataByMonth f = new FilterDataByMonth();
                f.month = i;
                f.data = filteredDataByMonth.FindAll(fv => fv.month == f.month);
                filterDataByMonth.Add(f);
            }
        }

        static void ConstructFinalObjectByDate()
        {
            for(int i = 1; i < 13; i++)
            {
                for(int j = 1; j < 32; j++)
                {
                    FilterDataByDay f = new FilterDataByDay();
                    DateTime d;
                    try
                    {
                        d = new DateTime(2012, i, j);
                    }
                    catch(Exception ex)
                    {
                        continue;
                    }

                    f.wind.min = f.wind.max = f.wind.avg = 0;
                    f.pressure.min = f.pressure.max = f.pressure.avg = 0;
                    f.dayOfYear = d.DayOfYear;

                    var tempData = filteredDataByDay.FindAll(fv => fv.month == d.Month && fv.day == d.Day);
                    int count = 0;
                    foreach(var data in tempData)
                    {
                        f.wind.min += data.wind.min;
                        f.wind.max += data.wind.max;
                        f.wind.avg += data.wind.avg;

                        f.pressure.min += data.pressure.min;
                        f.pressure.max += data.pressure.max;
                        f.pressure.avg += data.pressure.avg;

                        count++;
                    }
                    f.wind.max /= count;
                    f.wind.min /= count;
                    f.wind.avg /= count;
                    f.wind.max = CleanUp(f.wind.max);
                    f.wind.min = CleanUp(f.wind.min);
                    f.wind.avg = CleanUp(f.wind.avg);

                    f.pressure.max /= count;
                    f.pressure.min /= count;
                    f.pressure.avg /= count;


                    f.pressure.max = CleanUp(f.pressure.max);
                    f.pressure.min = CleanUp(f.pressure.min);
                    f.pressure.avg = CleanUp(f.pressure.avg);

                    f.numberOfSamples = count;

                    filterDataByDay.Add(f);
                }
            }

        }

        static float CleanUp(float v)
        {
            return Double.IsNaN((double)v) ? 0 : v;
        }
    }
}
