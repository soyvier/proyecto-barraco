export default function TableDataQuestion({ data, options, selectedAnswer, onSelect }) {
  const { headers, parcels, data: tableData } = data;
  const letters = ['A', 'B', 'C', 'D'];

  return (
    <div>
      <div className="flex justify-center mb-10 overflow-x-auto">
        <table className="border-collapse text-sm text-bone/70">
          <thead>
            <tr>
              <th className="border border-bone/15 px-3 py-2 bg-bone/[0.05]"></th>
              {parcels.map((p, i) => (
                <th key={i} className="border border-bone/15 px-3 py-2 bg-bone/[0.05] font-semibold">{p}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {headers.map((h, ri) => (
              <tr key={ri}>
                <td className="border border-bone/15 px-3 py-2 bg-bone/[0.03] font-medium">{h}</td>
                {parcels.map((_, ci) => (
                  <td key={ci} className="border border-bone/15 px-3 py-2 text-center">{tableData[ri][ci]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-center gap-5 flex-wrap">
        {options.map((opt, i) => {
          const isS = selectedAnswer === i;
          return (
            <button key={i} onClick={() => onSelect(i)}
              className="flex flex-col items-center gap-2 cursor-pointer bg-transparent border-0 p-0">
              <div className={`w-14 h-14 flex items-center justify-center rounded-lg border ${isS ? 'border-accent/50 bg-accent/10' : 'border-bone/10 bg-bone/[0.03]'}`}>
                <span className={`text-lg font-bold ${isS ? 'text-accent' : 'text-bone/60'}`}>{opt}</span>
              </div>
              <span className={`font-mono text-xs tracking-wider ${isS ? 'text-accent' : 'text-bone/30'}`}>{letters[i]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
