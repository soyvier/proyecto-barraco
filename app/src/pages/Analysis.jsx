import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAttempts } from '../services/storage';
import Starfield from '../components/Starfield';

export default function Analysis() {
  const navigate = useNavigate();
  const attempts = getAttempts();

  const stats = useMemo(() => {
    if (attempts.length === 0) return null;

    const categoryStats = {};
    const questionFailCount = {};
    let totalCorrect = 0;
    let totalWrong = 0;
    let totalBlank = 0;
    const grades = [];

    attempts.forEach((a) => {
      totalCorrect += a.correct;
      totalWrong += a.wrong;
      totalBlank += a.blank;
      grades.push({ date: a.date, grade: a.grade });

      a.details?.forEach((d) => {
        const cat = d.category || 'sin-categoria';
        if (!categoryStats[cat]) {
          categoryStats[cat] = { total: 0, correct: 0, wrong: 0, blank: 0 };
        }
        categoryStats[cat].total++;
        if (d.isBlank) categoryStats[cat].blank++;
        else if (d.isCorrect) categoryStats[cat].correct++;
        else categoryStats[cat].wrong++;

        if (!d.isCorrect && !d.isBlank) {
          questionFailCount[d.questionId] =
            (questionFailCount[d.questionId] || 0) + 1;
        }
      });
    });

    const mostFailed = Object.entries(questionFailCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id, count]) => {
        const detail = attempts
          .flatMap((a) => a.details || [])
          .find((d) => d.questionId === id);
        return { id, count, question: detail?.question || id };
      });

    const totalAnswered = totalCorrect + totalWrong + totalBlank;
    const blankRate =
      totalAnswered > 0
        ? ((totalBlank / totalAnswered) * 100).toFixed(1)
        : '0';

    return {
      totalExams: attempts.length,
      totalCorrect,
      totalWrong,
      totalBlank,
      blankRate,
      categoryStats,
      mostFailed,
      grades: grades.sort((a, b) => new Date(a.date) - new Date(b.date)),
      avgGrade:
        grades.length > 0
          ? (grades.reduce((s, g) => s + g.grade, 0) / grades.length).toFixed(2)
          : '0',
    };
  }, [attempts]);

  const catNames = {
    'aptitud-numerica': 'APTITUD NUMERICA',
    'series-numericas': 'SERIES NUMERICAS',
    'series-letras': 'SERIES DE LETRAS',
    'analogias-verbales': 'ANALOGIAS VERBALES',
    'sinonimos-antonimos': 'SINONIMOS / ANTONIMOS',
    'razonamiento-logico': 'RAZONAMIENTO LOGICO',
    'ortografia': 'ORTOGRAFIA',
    'atencion-percepcion': 'ATENCION / PERCEPCION',
  };

  return (
    <div className="min-h-screen relative">
      <Starfield />
      <div className="relative z-10 max-w-2xl mx-auto px-8 py-16">
        <button
          onClick={() => navigate('/psicotecnico')}
          className="text-bone/30 hover:text-bone/60 transition mb-16 bg-transparent border-0 cursor-pointer text-lg"
        >
          ←
        </button>

        <h1 className="text-center text-bone/80 text-xs tracking-[0.3em] font-light uppercase mb-12 anim-fade-down">
          ANALISIS
        </h1>

        {!stats ? (
          <div className="text-center py-20">
            <p className="text-bone/20 text-xs tracking-[0.2em]">
              REALIZA AL MENOS UN EXAMEN
            </p>
          </div>
        ) : (
          <>
            {/* Overview */}
            <div className="flex justify-center gap-12 mb-16 anim-fade-up anim-delay-1">
              <StatItem label="EXAMENES" value={stats.totalExams} />
              <StatItem
                label="NOTA MEDIA"
                value={stats.avgGrade}
                color={parseFloat(stats.avgGrade) >= 7 ? 'text-success' : parseFloat(stats.avgGrade) >= 5 ? 'text-warning' : 'text-danger'}
              />
              <StatItem label="BLANCOS" value={`${stats.blankRate}%`} />
              <StatItem label="FALLOS" value={stats.totalWrong} color="text-danger" />
            </div>

            {/* Grade evolution */}
            {stats.grades.length > 1 && (
              <div className="mb-16">
                <p className="text-bone/25 text-[9px] tracking-[0.3em] uppercase mb-6 text-center">
                  EVOLUCION
                </p>
                <div className="flex items-end gap-[3px] h-32 px-4">
                  {stats.grades.map((g, i) => {
                    const pct = (g.grade / 10) * 100;
                    const color = g.grade >= 7 ? 'bg-success/40' : g.grade >= 5 ? 'bg-warning/40' : 'bg-danger/40';
                    return (
                      <div
                        key={i}
                        className="flex-1 flex flex-col items-center justify-end"
                      >
                        <span className="text-bone/15 text-[8px] mb-1 font-mono">
                          {g.grade.toFixed(1)}
                        </span>
                        <div
                          className={`w-full ${color} rounded-t-sm min-h-[2px]`}
                          style={{ height: `${pct}%` }}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="border-t border-bone/5 mt-1 pt-2 px-4">
                  <div className="flex justify-between text-bone/10 text-[8px] tracking-wider">
                    <span>PRIMERO</span>
                    <span>ULTIMO</span>
                  </div>
                </div>
              </div>
            )}

            {/* Category breakdown */}
            <div className="mb-16">
              <p className="text-bone/25 text-[9px] tracking-[0.3em] uppercase mb-6 text-center">
                FALLOS POR CATEGORIA
              </p>
              <div className="space-y-4">
                {Object.entries(stats.categoryStats).map(([cat, s]) => {
                  const failRate =
                    s.total > 0 ? ((s.wrong / s.total) * 100).toFixed(0) : 0;
                  return (
                    <div key={cat}>
                      <div className="flex justify-between text-[10px] mb-2">
                        <span className="text-bone/40 tracking-wider">
                          {catNames[cat] || cat.toUpperCase()}
                        </span>
                        <span className="text-bone/20 font-mono">
                          {s.wrong}/{s.total} ({failRate}%)
                        </span>
                      </div>
                      <div className="w-full h-[2px] bg-bone/5">
                        <div
                          className="h-[2px] bg-danger/40 transition-all"
                          style={{ width: `${failRate}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Most failed */}
            {stats.mostFailed.length > 0 && (
              <div>
                <p className="text-bone/25 text-[9px] tracking-[0.3em] uppercase mb-6 text-center">
                  PREGUNTAS MAS FALLADAS
                </p>
                <div className="space-y-3">
                  {stats.mostFailed.map((q, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-4 border-l border-danger/20 pl-4 py-2"
                    >
                      <span className="text-danger/50 text-[10px] font-mono shrink-0">
                        x{q.count}
                      </span>
                      <p className="text-bone/35 text-xs font-light">{q.question}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function StatItem({ label, value, color = 'text-bone/50' }) {
  return (
    <div className="text-center">
      <p className={`text-xl font-extralight ${color}`}>{value}</p>
      <p className="text-bone/15 text-[8px] tracking-[0.2em] mt-1">{label}</p>
    </div>
  );
}
