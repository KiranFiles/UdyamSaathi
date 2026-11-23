import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { useCopy } from "../i18n";
const rows = [
  ["Indore", "इंदौर", 48, 18, 25],
  ["Bhopal", "भोपाल", 37, 11, 18],
  ["Ujjain", "उज्जैन", 29, 8, 14],
  ["Dewas", "देवास", 22, 7, 9],
] as const;
export default function DistrictDashboard() {
  const l = useCopy(),
    data = rows.map(([en, hi, drafts, gaps, matches]) => ({
      name: l(en, hi),
      drafts,
      gaps,
      matches,
    }));
  return (
    <>
      <p className="eyebrow">
        {l("DISTRICT DESK · MADHYA PRADESH", "ज़िला डेस्क · मध्य प्रदेश")}
      </p>
      <h1>{l("District insights", "ज़िला रिपोर्ट")}</h1>
      <p className="notice">
        {l(
          "Illustrative aggregates only. No owner sessions or live government records.",
          "केवल काल्पनिक आँकड़े। किसी मालिक या सरकारी रिकॉर्ड का डेटा नहीं।",
        )}
      </p>
      <section className="panel">
        <h2>{l("Drafts by district", "ज़िले के अनुसार ड्राफ़्ट")}</h2>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis width={35} />
            <Tooltip />
            <Bar
              dataKey="drafts"
              name={l("Drafts", "ड्राफ़्ट")}
              fill="#286b52"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
        <div className="scroll">
          <table>
            <thead>
              <tr>
                {[
                  l("District", "ज़िला"),
                  l("Drafts", "ड्राफ़्ट"),
                  l("Missing bank proof", "बैंक प्रमाण की कमी"),
                  l("Scheme matches", "योजना मिलान"),
                ].map((v) => (
                  <th key={v}>{v}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.name}>
                  <td>{d.name}</td>
                  <td>{d.drafts}</td>
                  <td>{d.gaps}</td>
                  <td>{d.matches}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
