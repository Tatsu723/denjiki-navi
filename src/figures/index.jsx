// 解説図（インラインSVG）。色は CSS 変数でライト/ダークに追従する。

function Arrow({ x1, y1, x2, y2, c = 'ink', w = 2, head = 9, dash }) {
  const ang = Math.atan2(y2 - y1, x2 - x1)
  const hx = x2 - head * Math.cos(ang)
  const hy = y2 - head * Math.sin(ang)
  const l = head * 0.55
  const p1 = `${hx + l * Math.sin(ang)},${hy - l * Math.cos(ang)}`
  const p2 = `${hx - l * Math.sin(ang)},${hy + l * Math.cos(ang)}`
  return (
    <g className={`c-${c}`}>
      <line x1={x1} y1={y1} x2={hx} y2={hy} strokeWidth={w} strokeDasharray={dash} className="stroke" />
      <polygon points={`${x2},${y2} ${p1} ${p2}`} className="fill" />
    </g>
  )
}

function T({ x, y, children, c = 'ink', size = 14, anchor = 'middle', weight }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fontSize={size} fontWeight={weight} className={`t-${c}`}>
      {children}
    </text>
  )
}

// 抵抗（箱型）
function Res({ x, y, w = 44, h = 16, vertical = false, label, lx, ly }) {
  const W = vertical ? h : w
  const H = vertical ? w : h
  return (
    <g>
      <rect x={x - W / 2} y={y - H / 2} width={W} height={H} rx="2" className="fg-res" />
      {label && <T x={lx ?? (vertical ? x + 22 : x)} y={ly ?? (vertical ? y + 5 : y - 14)} anchor={vertical ? 'start' : 'middle'}>{label}</T>}
    </g>
  )
}

// 電池（長い線が正極）。vertical のとき上が正極
function Battery({ x, y, vertical = true, label }) {
  return vertical ? (
    <g>
      <line x1={x - 16} y1={y - 5} x2={x + 16} y2={y - 5} className="fg-line" strokeWidth="2.5" />
      <line x1={x - 8} y1={y + 5} x2={x + 8} y2={y + 5} className="fg-line" strokeWidth="5" />
      {label && <T x={x - 24} y={y + 5} anchor="end">{label}</T>}
    </g>
  ) : (
    <g>
      <line x1={x + 5} y1={y - 16} x2={x + 5} y2={y + 16} className="fg-line" strokeWidth="2.5" />
      <line x1={x - 5} y1={y - 8} x2={x - 5} y2={y + 8} className="fg-line" strokeWidth="5" />
      {label && <T x={x} y={y - 22}>{label}</T>}
    </g>
  )
}

const W = (props) => <line {...props} className="fg-line" strokeWidth="2" />

function Svg({ vb, children, label }) {
  return (
    <svg viewBox={vb} role="img" aria-label={label} className="fig-svg">
      {children}
    </svg>
  )
}

// ───── 図の定義 ─────
const FIGS = {
  flow: () => (
    <Svg vb="0 0 680 270" label="解法フロー：起電力→回路→運動→エネルギー収支">
      <Arrow x1={40} y1={22} x2={640} y2={22} c="muted" w={1.5} />
      <T x={40} y={44} anchor="start" size={12} c="muted">上流（大原則に近い）</T>
      <T x={640} y={44} anchor="end" size={12} c="muted">下流</T>
      {[
        { x: 30, t: '1', s: '起電力', f: 'V = −N dΦ/dt', g: 'ファラデーの法則' },
        { x: 250, t: '2', s: '回路', f: 'キルヒホッフ', g: 'V=RI, L dI/dt, Q/C' },
        { x: 470, t: '3', s: '運動', f: 'F = IBL, qv×B', g: '運動方程式' },
      ].map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={60} width={180} height={110} rx="10" className="fg-card" />
          <circle cx={b.x + 30} cy={92} r={18} className="fg-badge" />
          <T x={b.x + 30} y={99} size={18} weight="700" c="onaccent">{b.t}</T>
          <T x={b.x + 58} y={98} anchor="start" size={15} weight="700">{b.s}</T>
          <T x={b.x + 90} y={134} size={13}>{b.f}</T>
          <T x={b.x + 90} y={156} size={12} c="muted">{b.g}</T>
          {i < 2 && <Arrow x1={b.x + 184} y1={115} x2={b.x + 216} y2={115} c="accent" w={3} />}
        </g>
      ))}
      <rect x={250} y={200} width={400} height={56} rx="10" className="fg-card fg-card-alt" />
      <T x={450} y={224} size={15} weight="700">エネルギー収支</T>
      <T x={450} y={245} size={12} c="muted">外力・重力の仕事 ＝ 運動エネルギー変化 ＋ ジュール熱 ＋ …</T>
      <path d="M560 172 C560 186 560 190 560 198" className="fg-line" strokeDasharray="5 4" fill="none" />
      <Arrow x1={560} y1={180} x2={560} y2={199} c="ink" w={1.5} />
      <T x={130} y={232} size={12} c="muted">力が求めにくい・時間変化する</T>
      <T x={130} y={250} size={12} c="muted">ときはこちらへ →</T>
    </Svg>
  ),

  maxwellMap: () => {
    const L = [
      ['①', '電場のガウスの法則', '電荷 → 電場が湧き出す'],
      ['②', '磁場のガウスの法則', '磁場に湧き出し口はない'],
      ['③', 'ファラデーの法則', '磁場の変化 → 渦の電場'],
      ['④', 'アンペール・マクスウェル', '電流・電場の変化 → 渦の磁場'],
    ]
    const R = [
      ['クーロンの法則・ガウスの法則', [0]],
      ['コンデンサーの電場・電位', [0]],
      ['磁力線は閉じている', [1]],
      ['電磁誘導・自己/相互誘導・変圧器', [2]],
      ['右ねじの法則・ソレノイドの磁場', [3]],
      ['電磁波（光）', [2, 3]],
    ]
    return (
      <Svg vb="0 0 680 330" label="マクスウェル方程式と高校の法則の対応">
        <T x={150} y={22} size={13} weight="700" c="muted">4つの大原則</T>
        <T x={540} y={22} size={13} weight="700" c="muted">高校で習う法則・現象</T>
        {L.map((l, i) => (
          <g key={i}>
            <rect x={10} y={36 + i * 72} width={280} height={58} rx="8" className="fg-card" />
            <T x={34} y={70 + i * 72} size={16} weight="700" c="accent">{l[0]}</T>
            <T x={56} y={61 + i * 72} anchor="start" size={14} weight="700">{l[1]}</T>
            <T x={56} y={82 + i * 72} anchor="start" size={12} c="muted">{l[2]}</T>
          </g>
        ))}
        {R.map((rr, j) => (
          <g key={j}>
            <rect x={420} y={36 + j * 48} width={250} height={36} rx="8" className="fg-card fg-card-alt" />
            <T x={545} y={59 + j * 48} size={12.5}>{rr[0]}</T>
            {rr[1].map((i) => (
              <path key={i} d={`M290 ${65 + i * 72} C 355 ${65 + i * 72}, 355 ${54 + j * 48}, 420 ${54 + j * 48}`} className="fg-link" fill="none" />
            ))}
          </g>
        ))}
      </Svg>
    )
  },

  gaussSurfaces: () => (
    <Svg vb="0 0 680 250" label="点電荷には球面、平面電荷には直方体の閉曲面">
      <circle cx={160} cy={125} r={78} className="fg-surface" />
      <circle cx={160} cy={125} r={14} className="fg-charge" />
      <T x={160} y={130} c="onaccent" weight="700">+</T>
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2
        return <Arrow key={i} x1={160 + 20 * Math.cos(a)} y1={125 + 20 * Math.sin(a)} x2={160 + 104 * Math.cos(a)} y2={125 + 104 * Math.sin(a)} c="red" w={1.5} head={7} />
      })}
      <T x={160} y={244} size={13}>点電荷 → 球面（E·4πr² = Q/ε₀）</T>
      <line x1={370} y1={125} x2={670} y2={125} className="fg-plane" strokeWidth="5" />
      {Array.from({ length: 9 }).map((_, i) => (
        <T key={i} x={385 + i * 34} y={113} size={12} c="red">+</T>
      ))}
      <rect x={470} y={62} width={100} height={126} className="fg-surface" />
      {[490, 520, 550].map((x) => (
        <g key={x}>
          <Arrow x1={x} y1={118} x2={x} y2={40} c="red" w={1.5} head={7} />
          <Arrow x1={x} y1={132} x2={x} y2={210} c="red" w={1.5} head={7} />
        </g>
      ))}
      <T x={600} y={80} anchor="start" size={12} c="muted">上面 S</T>
      <T x={600} y={180} anchor="start" size={12} c="muted">下面 S</T>
      <T x={520} y={244} size={13}>平面 → 直方体（2ES = σS/ε₀）</T>
    </Svg>
  ),

  twoBody: () => (
    <Svg vb="0 0 680 230" label="2物体の微小変位と間隔の変化">
      <T x={30} y={60} anchor="start" c="muted">はじめ</T>
      <line x1={180} y1={55} x2={480} y2={55} className="fg-line" strokeWidth="1.5" />
      <circle cx={180} cy={55} r={17} className="fg-q2" />
      <T x={180} y={60} size={13} weight="700">q₂</T>
      <circle cx={480} cy={55} r={17} className="fg-q1" />
      <T x={480} y={60} size={13} weight="700">q₁</T>
      <T x={330} y={44} size={13} c="muted">距離 r（はじめ）</T>
      <T x={30} y={150} anchor="start" c="muted">あと</T>
      <circle cx={180} cy={145} r={17} className="fg-ghost" />
      <circle cx={480} cy={145} r={17} className="fg-ghost" />
      <line x1={215} y1={145} x2={560} y2={145} className="fg-line" strokeWidth="1.5" />
      <circle cx={215} cy={145} r={17} className="fg-q2" />
      <T x={215} y={150} size={13} weight="700">q₂</T>
      <circle cx={560} cy={145} r={17} className="fg-q1" />
      <T x={560} y={150} size={13} weight="700">q₁</T>
      <T x={388} y={134} size={13} c="muted">距離 r（あと）</T>
      <Arrow x1={180} y1={178} x2={215} y2={178} c="blue" />
      <T x={198} y={198} size={13} c="blue">Δr₂</T>
      <Arrow x1={480} y1={178} x2={560} y2={178} c="red" />
      <T x={520} y={198} size={13} c="red">Δr₁</T>
      <T x={340} y={222} size={14} weight="700" c="accent">間隔の変化 ＝ Δr₁ − Δr₂（この差だけ r が変わる）</T>
    </Svg>
  ),

  potentialWall: () => {
    const x1 = 110, x2 = 570, base = 210
    const pts = []
    for (let x = x1 + 14; x <= x2 - 14; x += 4) {
      const u = 2600 / Math.abs(x - x1) + 2600 / Math.abs(x2 - x)
      const y = base - (u - 2 * 2600 / ((x2 - x1) / 2)) * 4.2 - 30
      if (y >= 22) pts.push(`${x},${y}`)
    }
    const yMin = base - 30
    return (
      <Svg vb="0 0 680 250" label="位置エネルギーの谷と壁">
        <Arrow x1={40} y1={base + 10} x2={650} y2={base + 10} c="muted" w={1.5} />
        <T x={650} y={base + 30} c="muted" size={12}>x</T>
        <Arrow x1={60} y1={base + 20} x2={60} y2={14} c="muted" w={1.5} />
        <T x={70} y={22} anchor="start" c="muted" size={12}>U(x)</T>
        <polyline points={pts.join(' ')} fill="none" className="fg-curve" strokeWidth="3" />
        <line x1={x1} y1={20} x2={x1} y2={base + 10} className="fg-line" strokeDasharray="4 4" />
        <line x1={x2} y1={20} x2={x2} y2={base + 10} className="fg-line" strokeDasharray="4 4" />
        <T x={x1} y={base + 30} size={12}>+Q</T>
        <T x={x2} y={base + 30} size={12}>+Q</T>
        <T x={x1 + 34} y={40} size={13} c="red" weight="700">壁</T>
        <T x={x2 - 34} y={40} size={13} c="red" weight="700">壁</T>
        <line x1={175} y1={98} x2={505} y2={98} className="fg-line" strokeDasharray="6 4" />
        <T x={340} y={90} size={12} c="muted">はじめの位置エネルギー（これより上には行けない）</T>
        <circle cx={185} cy={98} r={9} className="fg-ball" />
        <Arrow x1={200} y1={112} x2={300} y2={168} c="accent" w={2} />
        <circle cx={340} cy={yMin} r={5} className="fg-dot" />
        <T x={340} y={yMin + 22} size={13} weight="700" c="accent">谷底：速さ最大</T>
      </Svg>
    )
  },

  potentialGraph: () => (
    <Svg vb="0 0 680 250" label="回路の電位を高さで表したグラフ">
      <Arrow x1={50} y1={210} x2={650} y2={210} c="muted" w={1.5} />
      <Arrow x1={60} y1={220} x2={60} y2={20} c="muted" w={1.5} />
      <T x={70} y={16} anchor="start" c="muted" size={12}>電位（高さ）</T>
      <T x={640} y={232} anchor="end" c="muted" size={12}>回路に沿った位置</T>
      <polyline points="70,200 130,200 130,50 230,50 330,120 400,120 520,200 640,200" fill="none" className="fg-curve" strokeWidth="3" />
      <rect x={118} y={52} width={24} height={146} className="fg-band-battery" />
      <T x={150} y={100} anchor="start" size={13} weight="700" c="blue">電池：E 持ち上げる</T>
      <T x={280} y={70} size={13} c="red" weight="700">抵抗R₁：R₁I 下る</T>
      <T x={470} y={145} size={13} c="red" weight="700">抵抗R₂：R₂I 下る</T>
      <T x={360} y={110} size={12} c="muted">導線：電位一定</T>
      <T x={360} y={240} size={13} weight="700" c="accent">1周すると元の高さ：E − R₁I − R₂I = 0</T>
    </Svg>
  ),

  kirchhoffLoop: () => (
    <Svg vb="0 0 720 260" label="閉回路をたどるキルヒホッフの第2法則">
      <W x1={120} y1={40} x2={290} y2={40} />
      <W x1={370} y1={40} x2={440} y2={40} />
      <W x1={440} y1={40} x2={440} y2={100} />
      <W x1={440} y1={160} x2={440} y2={220} />
      <W x1={440} y1={220} x2={120} y2={220} />
      <W x1={120} y1={220} x2={120} y2={137} />
      <W x1={120} y1={123} x2={120} y2={40} />
      <Res x={330} y={40} w={80} label="R₁" />
      <Res x={440} y={130} w={60} vertical label="R₂" />
      <Battery x={120} y={130} label="E" />
      <T x={140} y={118} anchor="start" size={11} c="muted">＋</T>
      <T x={140} y={146} anchor="start" size={11} c="muted">−</T>
      <Arrow x1={180} y1={40} x2={230} y2={40} c="red" w={3} />
      <T x={205} y={30} c="red" size={13}>I</T>
      <path d="M 250 130 A 45 45 0 1 1 330 160" fill="none" className="fg-loop" strokeWidth="2" />
      <Arrow x1={322} y1={165} x2={334} y2={155} c="accent" w={2} />
      <T x={282} y={135} size={12} c="accent">1周</T>
      <T x={515} y={70} anchor="start" size={13}>電池（−→＋）：<tspan className="t-blue">＋E</tspan></T>
      <T x={515} y={95} anchor="start" size={13}>R₁（電流の向き）：<tspan className="t-red">−R₁I</tspan></T>
      <T x={515} y={120} anchor="start" size={13}>R₂（電流の向き）：<tspan className="t-red">−R₂I</tspan></T>
      <line x1={515} y1={135} x2={675} y2={135} className="fg-line" strokeWidth="1" />
      <T x={515} y={158} anchor="start" size={14} weight="700" c="accent">E − R₁I − R₂I = 0</T>
      <T x={515} y={182} anchor="start" size={12} c="muted">（上がった分 ＝ 下がった分）</T>
    </Svg>
  ),

  parallelCompare: () => (
    <Svg vb="0 0 680 240" label="2点を共有する導線どうしなら比較できる">
      <g>
        <W x1={40} y1={110} x2={80} y2={110} />
        <W x1={80} y1={60} x2={80} y2={160} />
        <W x1={80} y1={60} x2={140} y2={60} />
        <W x1={200} y1={60} x2={260} y2={60} />
        <W x1={80} y1={160} x2={140} y2={160} />
        <W x1={200} y1={160} x2={260} y2={160} />
        <W x1={260} y1={60} x2={260} y2={160} />
        <W x1={260} y1={110} x2={300} y2={110} />
        <Res x={170} y={60} w={60} label="R₁" />
        <Res x={170} y={160} w={60} label="R₂" ly={190} />
        <circle cx={80} cy={110} r={6} className="fg-node" />
        <circle cx={260} cy={110} r={6} className="fg-node" />
        <T x={66} y={104} anchor="end" size={13} weight="700">A</T>
        <T x={274} y={104} anchor="start" size={13} weight="700">B</T>
        <T x={170} y={222} size={13} weight="700" c="green">○ 同じ2点A・Bを共有 → 比較できる</T>
      </g>
      <g>
        <W x1={390} y1={60} x2={460} y2={60} />
        <W x1={520} y1={60} x2={590} y2={60} />
        <Res x={490} y={60} w={60} label="R₁" />
        <W x1={420} y1={160} x2={480} y2={160} />
        <W x1={540} y1={160} x2={640} y2={160} />
        <Res x={510} y={160} w={60} label="R₂" ly={190} />
        <circle cx={390} cy={60} r={5} className="fg-node" />
        <circle cx={590} cy={60} r={5} className="fg-node" />
        <circle cx={420} cy={160} r={5} className="fg-node" />
        <circle cx={640} cy={160} r={5} className="fg-node" />
        <T x={515} y={115} size={30} c="red" weight="700">×</T>
        <T x={515} y={222} size={13} weight="700" c="red">× 端点が別々 → 比較できない</T>
      </g>
    </Svg>
  ),

  ladder: () => (
    <Svg vb="0 0 680 230" label="はしご型回路の置き換え">
      <rect x={300} y={22} width={300} height={176} rx="8" className="fg-shade" />
      <T x={450} y={16} size={12} c="accent" weight="700">点線で囲んだ部分</T>
      <W x1={30} y1={50} x2={70} y2={50} />
      <W x1={130} y1={50} x2={330} y2={50} />
      <W x1={390} y1={50} x2={560} y2={50} />
      <W x1={30} y1={180} x2={560} y2={180} />
      <Res x={100} y={50} w={60} label="R" />
      <Res x={360} y={50} w={60} label="R" />
      <W x1={220} y1={50} x2={220} y2={90} />
      <W x1={220} y1={140} x2={220} y2={180} />
      <Res x={220} y={115} w={50} vertical label="2R" />
      {[470, 560].map((x) => (
        <g key={x}>
          <W x1={x} y1={50} x2={x} y2={90} />
          <W x1={x} y1={140} x2={x} y2={180} />
          <Res x={x} y={115} w={50} vertical label="2R" />
        </g>
      ))}
      <T x={340} y={218} size={13}>① 2R ∥ 2R ＝ R　→　② R ＋ R ＝ 2R　→　囲んだ部分 ＝ 2R</T>
    </Svg>
  ),

  coilFields: () => (
    <Svg vb="0 0 680 250" label="コイル内部の誘導電場と静電場">
      <W x1={40} y1={150} x2={160} y2={150} />
      <W x1={520} y1={150} x2={640} y2={150} />
      {Array.from({ length: 8 }).map((_, i) => (
        <path key={i} d={`M ${160 + i * 45} 150 c 0 -48, 45 -48, 45 0`} fill="none" className="fg-line" strokeWidth="2.5" />
      ))}
      <Arrow x1={60} y1={170} x2={130} y2={170} c="ink" w={2.5} />
      <T x={95} y={192} size={13}>I（増加中）</T>
      <circle cx={160} cy={150} r={6} className="fg-node" />
      <circle cx={520} cy={150} r={6} className="fg-node" />
      <T x={160} y={180} size={16} weight="700" c="red">＋</T>
      <T x={520} y={180} size={16} weight="700" c="blue">−</T>
      <Arrow x1={440} y1={60} x2={240} y2={60} c="red" w={3} />
      <T x={340} y={48} size={13} c="red" weight="700">誘導電場 Eᵢ（起電力 Vᵢ のもと）</T>
      <Arrow x1={240} y1={78} x2={440} y2={78} c="blue" w={3} />
      <T x={340} y={100} size={13} c="blue" weight="700">静電場 Eₛ（電荷がつくる）</T>
      <T x={340} y={218} size={14} weight="700" c="accent">Eₛ ＋ Eᵢ ＝ 0　→　電位差 Vₛ ＝ L dI/dt（電圧降下）</T>
      <T x={340} y={240} size={12} c="muted">電位に関与するのは保存力である静電場 Eₛ だけ</T>
    </Svg>
  ),

  upstream: () => (
    <Svg vb="0 0 680 170" label="上流側と下流側の電位">
      <W x1={60} y1={80} x2={250} y2={80} />
      <W x1={430} y1={80} x2={620} y2={80} />
      <rect x={250} y={55} width={180} height={50} rx="8" className="fg-card" />
      <T x={340} y={86} size={14} weight="700">起電力 V</T>
      <Arrow x1={90} y1={60} x2={200} y2={60} c="red" w={3} />
      <T x={145} y={48} size={13} c="red">電流 I</T>
      <circle cx={250} cy={80} r={6} className="fg-node" />
      <circle cx={430} cy={80} r={6} className="fg-node" />
      <T x={200} y={120} size={13} weight="700">上流側 V₁</T>
      <T x={200} y={140} size={11} c="muted">（電流が流れてくる側）</T>
      <T x={480} y={120} size={13} weight="700">下流側 V₂</T>
      <T x={340} y={162} size={14} weight="700" c="accent">V ＝ V₁ − V₂（下流側から見た上流側の電位）</T>
    </Svg>
  ),

  virtualCircuit: () => {
    const cx = 170, cy = 125, a = 90, th = (40 * Math.PI) / 180
    const px = cx + a * Math.sin(th), py = cy + a * Math.cos(th)
    const tx = Math.cos(th), ty = -Math.sin(th)
    return (
      <Svg vb="0 0 680 260" label="仮想的な回路と正射影">
        <Arrow x1={110} y1={18} x2={230} y2={18} c="ink" w={2} />
        <T x={244} y={23} anchor="start" size={14} weight="700">B</T>
        <circle cx={cx} cy={cy} r={a} fill="none" className="fg-line" strokeWidth="2" />
        <circle cx={cx} cy={cy} r={3.5} className="fg-dot-ink" />
        <line x1={cx} y1={cy} x2={cx} y2={cy + a} className="fg-line" strokeDasharray="4 4" />
        <line x1={cx} y1={cy} x2={px} y2={py} className="fg-line" strokeWidth="1.5" />
        <T x={cx - 14} y={cy + 50} size={13}>a</T>
        <T x={cx + 10} y={cy + 32} size={12}>θ</T>
        <polyline points={`${cx},${cy} ${px},${cy} ${px},${py}`} fill="none" className="fg-c1" strokeWidth="3" />
        <T x={px + 8} y={cy + 22} anchor="start" size={12} c="amber">a cosθ</T>
        <line x1={px} y1={py} x2={px} y2={cy + a + 8} className="fg-c2" strokeWidth="3" />
        <circle cx={px} cy={py} r={6} className="fg-dot-ink" />
        <Arrow x1={px} y1={py} x2={px + 55 * tx} y2={py + 55 * ty} c="red" w={2.5} />
        <T x={px + 62 * tx + 4} y={py + 62 * ty} anchor="start" size={13} c="red">v</T>
        <Arrow x1={px - 16} y1={py} x2={px - 16} y2={py + 55 * ty} c="muted" w={1.5} head={7} />
        <T x={px - 22} y={py - 12} anchor="end" size={11} c="muted">v sinθ</T>
        <T x={cx} y={250} size={12} c="muted">（円形レールを横から見た図。棒は紙面に垂直）</T>
        <g>
          <rect x={360} y={30} width={305} height={92} rx="10" className="fg-card" />
          <T x={375} y={56} anchor="start" size={13} weight="700" c="amber">① 中心の高さ〜棒の回路</T>
          <T x={375} y={80} anchor="start" size={12.5}>正射影の面積 S = L·a cosθ</T>
          <T x={375} y={102} anchor="start" size={12.5}>Φ = BLa cosθ → V = vBL sinθ</T>
          <rect x={360} y={134} width={305} height={92} rx="10" className="fg-card" />
          <T x={375} y={160} anchor="start" size={13} weight="700" c="green">② 棒〜最下点の高さの回路</T>
          <T x={375} y={184} anchor="start" size={12.5}>面積の時間変化 ΔS/Δt = ∓Lv sinθ</T>
          <T x={375} y={206} anchor="start" size={12.5}>→ 起電力は①と同じ値・同じ向き</T>
        </g>
      </Svg>
    )
  },

  transformer: () => (
    <Svg vb="0 0 680 250" label="変圧器：1次と2次で同じ磁束を共有">
      <rect x={200} y={40} width={280} height={170} rx="6" className="fg-core" />
      <rect x={240} y={80} width={200} height={90} rx="4" className="fg-hole" />
      {Array.from({ length: 5 }).map((_, i) => (
        <ellipse key={'l' + i} cx={220} cy={78 + i * 24} rx={30} ry={7} fill="none" className="fg-coil1" strokeWidth="2.5" />
      ))}
      {Array.from({ length: 7 }).map((_, i) => (
        <ellipse key={'r' + i} cx={460} cy={70 + i * 18} rx={30} ry={6} fill="none" className="fg-coil2" strokeWidth="2.5" />
      ))}
      <Arrow x1={300} y1={60} x2={380} y2={60} c="accent" w={3} />
      <Arrow x1={460} y1={175} x2={460} y2={200} c="accent" w={3} head={8} />
      <Arrow x1={380} y1={190} x2={300} y2={190} c="accent" w={3} />
      <Arrow x1={220} y1={70} x2={220} y2={55} c="accent" w={3} head={8} />
      <T x={340} y={130} size={15} weight="700" c="accent">同じ磁束 Φ</T>
      <T x={340} y={150} size={12} c="muted">（鉄心から漏れない）</T>
      <T x={120} y={120} size={14} weight="700">1次</T>
      <T x={120} y={142} size={13}>N₁, V₁</T>
      <T x={560} y={120} size={14} weight="700">2次</T>
      <T x={560} y={142} size={13}>N₂, V₂</T>
      <T x={340} y={238} size={13}>V₁ = −N₁ dΦ/dt,  V₂ = −N₂ dΦ/dt　→　V₁ : V₂ = N₁ : N₂</T>
    </Svg>
  ),

  rodRail: () => (
    <Svg vb="0 0 680 290" label="鉛直レール上を落下する金属棒">
      <W x1={200} y1={40} x2={200} y2={270} />
      <W x1={420} y1={40} x2={420} y2={270} />
      <W x1={200} y1={40} x2={280} y2={40} />
      <W x1={340} y1={40} x2={420} y2={40} />
      <Res x={310} y={40} w={60} label="R" />
      <T x={200} y={286} size={13} weight="700">X</T>
      <T x={420} y={286} size={13} weight="700">Y</T>
      {[[250, 90], [370, 90], [250, 220], [370, 220], [310, 250], [470, 130], [150, 200]].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={8} fill="none" className="fg-line" strokeWidth="1.5" />
          <circle cx={x} cy={y} r={2.5} className="fg-dot-ink" />
        </g>
      ))}
      <T x={490} y={135} anchor="start" size={13}>B（紙面の裏→表）</T>
      <rect x={196} y={150} width={228} height={10} rx="3" className="fg-rod" />
      <T x={440} y={160} anchor="start" size={13} weight="700">P（質量 m）</T>
      <Arrow x1={390} y1={176} x2={230} y2={176} c="red" w={2.5} />
      <T x={310} y={196} size={13} c="red">I（Y→X：起電力の向き）</T>
      <Arrow x1={310} y1={148} x2={310} y2={104} c="blue" w={3} />
      <T x={318} y={116} anchor="start" size={13} c="blue">IBd</T>
      <Arrow x1={560} y1={180} x2={560} y2={250} c="ink" w={2.5} />
      <T x={568} y={220} anchor="start" size={13}>v</T>
      <T x={150} y={150} anchor="end" size={13} weight="700" c="accent">高電位</T>
      <Arrow x1={154} y1={145} x2={192} y2={152} c="accent" w={1.5} head={7} />
    </Svg>
  ),
}

export function Figure({ name, caption }) {
  const F = FIGS[name]
  if (!F) return null
  return (
    <figure className="fig">
      <F />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}
