import { useState, useEffect, useRef } from "react";

// ─── PALETTE ────────────────────────────────────────────────
const C = {
  bg: "#04060d", surface: "#080d18", card: "#0c1220",
  border: "#111e33", borderHi: "#1e3558",
  text: "#c9d8ea", muted: "#3a556e", dim: "#1a2d42",
  accent: "#4f8fff", accentLo: "#1a3566",
  green: "#10b981", greenLo: "#052e1c",
  amber: "#f59e0b", amberLo: "#2d1f05",
  red: "#ef4444", redLo: "#2a0a0a",
  purple: "#8b5cf6", purpleLo: "#1a0d33",
  teal: "#06b6d4", tealLo: "#031f28",
};

// ─── AGENTS ─────────────────────────────────────────────────
const AGENTS_DEFAULT = [
  {
    id: "seo", name: "SEO Manager", initials: "SM",
    color: C.purple, colorLo: C.purpleLo, type: "ai", status: "active",
    lastAction: "Анализ 18 378 crawled-not-indexed страниц",
    kpi: [
      { l: "Crawled not indexed", v: "18 378", bad: true },
      { l: "GSC позиция avg", v: "8.4" },
      { l: "Клики/мес", v: "932" },
    ],
    prompt: `Ты — SEO Manager Gaming Goods Exchange. Отвечаешь Инвестору — коротко, с выводами и действиями.

ТВОЙ ФРЕЙМВОРК РЕШЕНИЙ:
1. "Как есть" → "как стало" → что изменилось и почему
2. Каждый инсайт заканчивай: ДЕЙСТВИЕ: [конкретный шаг]
3. Приоритизируй по ROI: что даст больше кликов/конверсий быстрее

ТВОИ KPI (цели на месяц):
- crawled_not_indexed: 18 378 → ≤9 000 (−50%)
- avg_position: 8.4 → ≤6.0
- clicks_28d: 932 → 2 000+
- ctr: 5.9% → 7.5%

СТЕК ИНСТРУМЕНТОВ:
- GSC API: индексация, позиции, CTR, sitemaps
- PostgreSQL: thin_content (<100 слов), no_schema, oos_visible, moderated=false
- Schema.org: Product + FAQPage + HowTo на каждой карточке

ИЗВЕСТНЫЕ ПРОБЛЕМЫ:
- RE Requiem ID:2067417 — moderated=FALSE (не индексируется)
- Sitemaps: 700+ warnings, устарели 52 дня
- 18 378 OOS товаров с hidden=false (thin/irrelevant content для Google)
- Все карточки без FAQPage — теряем featured snippets

ФОРМАТ ОТВЕТА:
📊 СИТУАЦИЯ: [данные из LIVE DATA]
📈 ДИНАМИКА: [сравнение с вчера/неделей]
🎯 ТОП-3 ДЕЙСТВИЯ: приоритизированный список
⚠️ РИСКИ: что может ухудшиться если не действовать

SQL для диагностики готов дать по запросу.`,
  },
  {
    id: "strategy", name: "Strategy", initials: "ST",
    color: C.accent, colorLo: C.accentLo, type: "ai", status: "active",
    lastAction: "CEO Brief отправлен в 07:30",
    kpi: [
      { l: "Revenue / 30 дней", v: "€13 974" },
      { l: "Конверсия", v: "7.5%" },
      { l: "YM SHOP_FAILED", v: "67%", bad: true },
    ],
    prompt: `Ты — Strategy Manager Gaming Goods Exchange. Отвечаешь Инвестору — цифры, выводы, решения.

ТВОЙ ФРЕЙМВОРК РЕШЕНИЙ:
1. Всегда считай opportunity cost: "если не исправим X — теряем €Y в день"
2. Сравнивай вчера vs avg 7 дней vs avg 30 дней
3. Каждый анализ → конкретное решение с прогнозом ROI

ТВОИ KPI (цели):
- Revenue/день: €465 → €650 (+40% после фикса YM)
- Конверсия: 7.5% → 9%
- YM SHOP_FAILED: 67% → <5%
- Stuck fulfilled: 470 → 0

БИЗНЕС-КОНТЕКСТ:
- Hybrid marketplace C2C+B2C: продавцы + Kinguin + Fragment + Playwallet
- Выплата продавцу ТОЛЬКО после COMPLETED (покупатель подтвердил)
- Комиссия платформы: 0% (привлечение продавцов)
- Главный канал: Organic Search RU (2 180 сессий)
- Лучший канал: Referral (22% CR) — масштабировать

ТЕКУЩИЙ P0:
- YM SHOP_FAILED: 67% = −₽12 928/день
- Саша ищет ошибку: undefined kinguin_offer_id для XBOX/Gift Card SKU
- После фикса: +€215/день прогноз

ФОРМАТ ОТВЕТА:
💰 ДЕНЬГИ: вчера vs avg, delta %
🔴 ПРОБЛЕМЫ: с денежной оценкой потерь
🟢 ВОЗМОЖНОСТИ: ROI прогноз
📌 РЕШЕНИЕ ДНЯ: одно главное действие`,
  },
  {
    id: "marketing", name: "Marketing", initials: "MK",
    color: C.amber, colorLo: C.amberLo, type: "ai", status: "active",
    lastAction: "YM feed: 123 749 офферов активны",
    kpi: [
      { l: "YM Офферов", v: "123 749" },
      { l: "Referral CR", v: "22%" },
      { l: "Nutaku views", v: "5 528" },
    ],
    prompt: `Ты — Marketing Manager Gaming Goods Exchange. Отвечаешь Инвестору — каналы, конверсии, эксперименты.

ТВОЙ ФРЕЙМВОРК РЕШЕНИЙ:
1. Каждый канал оцениваешь: трафик × CR × avg_check = revenue contribution
2. A/B гипотезы формулируешь: "Если изменить X → ожидаю Y% роста CTR потому что Z"
3. Приоритет: сначала fix broken (YM), потом scale working (Referral), потом test new

ТВОИ KPI (цели):
- YM CTR карточек: <1% → >3% (после фикса SHOP_FAILED)
- YM ROAS: ? → >3.0
- Abandoned cart recovery: 0% → 8%
- Referral CR: 22% → 25%

КАНАЛЫ И ИХ СОСТОЯНИЕ:
- Organic Search RU: 2 180 сессий/мес — основной, работает
- Referral: 22% CR — лучший, масштабировать через промо-коды продавцам
- ЯМ: 123 749 офферов, 3 дня работы, ЗАМОРОЖЕН из-за SHOP_FAILED
- Email/Telegram: abandoned cart — WF-401 не запущен, теряем корзины
- Brazil/China: 905 сессий, 0 конверсий — блокировка платёжных методов?

A/B ОЧЕРЕДЬ (после фикса YM):
- Nutaku: 5 528 просмотров, низкий CTR → тест заголовков
- Standoff2: CTR 2.9% → тест мета-описаний  
- Карточки YM: заголовок с ценой vs без цены

ФОРМАТ ОТВЕТА:
📣 КАНАЛЫ: состояние каждого кратко
🧪 ГИПОТЕЗА ДНЯ: один A/B тест с ожидаемым результатом
💸 ПОТЕРИ ОТ БЕЗДЕЙСТВИЯ: abandoned + YM + Brazil
🚀 СЛЕДУЮЩИЙ ШАГ: конкретное действие`,
  },
  {
    id: "product", name: "Product", initials: "PM",
    color: C.green, colorLo: C.greenLo, type: "ai", status: "active",
    lastAction: "Order Watchdog: 0 stuck заказов",
    kpi: [
      { l: "Листингов", v: "131 234" },
      { l: "На модерации", v: "10 240", bad: true },
      { l: "OOS visible", v: "18 378", bad: true },
    ],
    prompt: `Ты — Product Manager Gaming Goods Exchange. Отвечаешь Инвестору — операции, каталог, заказы.

ТВОЙ ФРЕЙМВОРК РЕШЕНИЙ:
1. Stuck order = потенциальный возврат + негативный отзыв + потеря продавца
2. OOS visible = плохой UX + вред SEO (thin content для Google)
3. Moderation queue = задержка revenue для продавцов = отток продавцов

ТВОИ KPI (цели):
- Stuck paid/inprogress >2h: 0
- Stuck fulfilled >24h: 470 → 0 (авто-reminder покупателю)
- Moderation queue: 10 240 → <500 (batch processing)
- OOS visible: 18 378 → 0 (hidden=true WHERE quantity=0)

АРХИТЕКТУРА ЗАКАЗОВ:
created → paid → [in_progress] → fulfilled → completed
- Деньги продавцу: только при COMPLETED
- Auto-delivery: auto_messages или local_offers_data.codes
- INFINITY_AMOUNT=1111111 (Kinguin/Fragment/Playwallet — бесконечный сток)

ПАРТНЁРЫ И ИХ ОСОБЕННОСТИ:
- Kinguin: валидация цены ПЕРЕД созданием заказа, SHOP_FAILED = mapping bug
- Fragment API: Telegram Username + Stars
- Playwallet: оптовое пополнение Steam

СРОЧНО:
- RE Requiem ID:2067417 — moderated=FALSE → промодерировать сейчас
- 10 240 товаров в очереди → настроить batch-модерацию

TELEGRAM BOT /команды:
/stats /today /queue /ym /alerts — отвечаю на всё

ФОРМАТ ОТВЕТА:
⚙️ ОПЕРАЦИИ: stuck orders, moderation queue
📦 КАТАЛОГ: ключевые проблемы листингов  
🔴 СРОЧНО: что надо сделать сегодня
✅ SQL: даю запрос если нужна диагностика`,
  },
  {
    id: "sasha", name: "Саша", initials: "CA",
    color: C.teal, colorLo: C.tealLo, type: "human", status: "away",
    lastAction: "Ищет логи YM SHOP_FAILED 09:42-09:45",
    kpi: [
      { l: "P0 задач", v: "1", bad: true },
      { l: "P1 задач", v: "3" },
      { l: "Статус", v: "В работе" },
    ],
    prompt: `Саша — backend-разработчик GG Exchange. Человек, не ИИ.
Стек: Node.js, TypeScript, PostgreSQL, Render.com
P0: Найти и починить YM SHOP_FAILED (логи 01.03.2026 09:42-09:45)`,
  },
];

const FLOWS = [
  { id: "WF-000", name: "Render Keepalive",  agent: "product",   status: "live",     trigger: "15мин" },
  { id: "WF-011", name: "Order Watchdog",    agent: "product",   status: "live",     trigger: "30мин" },
  { id: "WF-012", name: "CEO Brief",         agent: "strategy",  status: "live",     trigger: "07:30" },
  { id: "WF-013", name: "Telegram Bot",      agent: "product",   status: "live",     trigger: "webhook" },
  { id: "WF-001", name: "GSC Crisis Monitor",agent: "seo",       status: "building", trigger: "08:00" },
  { id: "WF-014", name: "AI Context Builder",agent: "strategy",  status: "building", trigger: "06:00" },
  { id: "WF-401", name: "Abandoned Recovery",agent: "marketing", status: "planned",  trigger: "2ч" },
  { id: "WF-501", name: "SEO Audit Pipeline",agent: "seo",       status: "planned",  trigger: "вс 22:00" },
  { id: "WF-601", name: "Revenue / SKU",     agent: "strategy",  status: "planned",  trigger: "пн 07:00" },
  { id: "WF-701", name: "YM Feed Generator", agent: "marketing", status: "planned",  trigger: "4ч" },
  { id: "WF-101", name: "Kinguin Pipeline",  agent: "product",   status: "planned",  trigger: "1ч" },
  { id: "WF-702", name: "YM Watchdog",       agent: "marketing", status: "planned",  trigger: "30мин" },
];

const INITIAL_ACTIVITIES = [
  { id: 1, agent: "strategy", time: "07:30", text: "CEO Brief: Revenue вчера €412 (−11% vs avg). YM SHOP_FAILED 67% — P0 активен.", type: "report" },
  { id: 2, agent: "product",  time: "08:00", text: "Order Watchdog: проверено 847 заказов. 0 stuck >2ч. 470 в fulfilled.", type: "check" },
  { id: 3, agent: "seo",      time: "08:01", text: "GSC: 18 378 crawled-not-indexed (без изменений). Sitemaps warnings: 700+.", type: "alert" },
  { id: 4, agent: "marketing",time: "08:15", text: "YM Feed обновлён: 123 749 офферов. API статус: ✓ Online.", type: "sync" },
  { id: 5, agent: "product",  time: "08:30", text: "Kinguin API: 3 товара изменили цену >5% — обновлено в БД автоматически.", type: "sync" },
  { id: 6, agent: "strategy", time: "09:00", text: "Прогноз: если YM SHOP_FAILED починят сегодня — +€215/день дополнительно.", type: "insight" },
  { id: 7, agent: "seo",      time: "09:15", text: "Schema.org: проверено 10 карточек. FAQPage отсутствует на всех. Нужна разметка.", type: "alert" },
  { id: 8, agent: "sasha",    time: "09:45", text: "Нашёл webhook handler YM. Ищу логи за 09:42-09:45. Подозрение: kinguin_offer_id mapping.", type: "human" },
];

const STORAGE_KEY = "gg_investor_os_v3";
const NAV = [
  { id: "overview",  icon: "◈", label: "Обзор" },
  { id: "chat",      icon: "◎", label: "Чат с командой" },
  { id: "activity",  icon: "▸", label: "Активность" },
  { id: "flows",     icon: "⟳", label: "Воркфлоу" },
  { id: "prompts",   icon: "✦", label: "Промпты" },
];

// ─── API CALL (через наш бэкенд) ────────────────────────────
async function callClaude(agentId, messages) {
  const res = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ agentId, messages }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.content?.[0]?.text || "Пустой ответ.";
}

function timeNow() {
  return new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

// ─── SMALL COMPONENTS ───────────────────────────────────────
function Avatar({ agent, size = 32 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: agent.colorLo, border: `1.5px solid ${agent.color}60`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.32, color: agent.color, fontWeight: 700,
      flexShrink: 0, fontFamily: "'Courier New', monospace",
    }}>
      {agent.initials}
    </div>
  );
}

function StatusDot({ status }) {
  const c = { active: C.green, away: C.amber, offline: C.muted }[status] || C.muted;
  return <div style={{ width: 7, height: 7, borderRadius: "50%", background: c, flexShrink: 0, boxShadow: status === "active" ? `0 0 5px ${c}` : "none" }} />;
}

function Chip({ children, color }) {
  return <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 4, background: color + "18", border: `1px solid ${color}30`, color, letterSpacing: 0.5 }}>{children}</span>;
}

function SmBtn({ children, color, primary, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: "5px 14px", borderRadius: 6, cursor: disabled ? "not-allowed" : "pointer",
      background: primary ? color + "20" : "transparent",
      border: `1px solid ${color}50`, color,
      fontSize: 10, opacity: disabled ? 0.5 : 1, transition: "all 0.15s",
      fontFamily: "inherit",
    }}>{children}</button>
  );
}

// ─── VIEWS ──────────────────────────────────────────────────
function OverviewView({ agents }) {
  const kpis = [
    { l: "Revenue / 30d",    v: "€13 974", sub: "€465 avg/день",     c: C.green },
    { l: "YM SHOP_FAILED",   v: "67%",     sub: "−₽12 928/день",     c: C.red, bad: true },
    { l: "Листингов в БД",   v: "131 234", sub: "10 240 на модерации",c: C.accent },
    { l: "Crawled not index",v: "18 378",  sub: "страниц в GSC",     c: C.amber, bad: true },
    { l: "GSC позиция avg",  v: "8.4",     sub: "цель: 6.0",          c: C.purple },
    { l: "Конверсия",        v: "7.5%",    sub: "605 конверсий / 30d",c: C.green },
  ];
  return (
    <div style={{ padding: "20px 24px", overflowY: "auto", height: "100%" }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 800, fontSize: 22, color: C.text, marginBottom: 4 }}>Добро пожаловать, Инвестор</div>
        <div style={{ fontSize: 11, color: C.muted }}>Gaming Goods Exchange · {new Date().toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 24 }}>
        {kpis.map(k => (
          <div key={k.l} style={{ background: k.bad ? C.redLo : C.card, border: `1px solid ${k.bad ? C.red + "30" : C.border}`, borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 9, color: C.muted, letterSpacing: 1.5, marginBottom: 8, textTransform: "uppercase" }}>{k.l}</div>
            <div style={{ fontWeight: 800, fontSize: 26, color: k.c, lineHeight: 1 }}>{k.v}</div>
            <div style={{ fontSize: 9, color: k.bad ? C.red + "80" : C.muted, marginTop: 5 }}>{k.sub}</div>
          </div>
        ))}
      </div>
      <div style={{ fontWeight: 700, fontSize: 13, color: C.text, marginBottom: 12 }}>Команда</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {agents.map(a => (
          <div key={a.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar agent={a} size={36} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                <span style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>{a.name}</span>
                <StatusDot status={a.status} />
                <Chip color={a.type === "ai" ? C.accent : C.teal}>{a.type === "ai" ? "AI" : "Human"}</Chip>
              </div>
              <div style={{ fontSize: 10, color: C.muted }}>{a.lastAction}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${a.kpi.length}, 1fr)`, gap: 6 }}>
              {a.kpi.map(k => (
                <div key={k.l} style={{ background: k.bad ? C.redLo : C.surface, border: `1px solid ${k.bad ? C.red + "25" : C.border}`, borderRadius: 6, padding: "4px 8px", textAlign: "center" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: k.bad ? C.red : C.text }}>{k.v}</div>
                  <div style={{ fontSize: 7, color: C.muted }}>{k.l}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChatView({ agents, chatState, setChatState }) {
  const { activeAgentId, threads } = chatState;
  const activeAgent = agents.find(a => a.id === activeAgentId);
  const thread = threads[activeAgentId] || [];
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [thread, loading]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    const history = [...thread, { role: "user", content: userMsg }];
    setChatState(s => ({ ...s, threads: { ...s.threads, [activeAgentId]: history } }));

    if (activeAgent.type === "human") {
      setTimeout(() => setChatState(s => ({
        ...s,
        threads: { ...s.threads, [activeAgentId]: [...(s.threads[activeAgentId] || []), { role: "assistant", content: "📨 Сообщение доставлено Саше. Ответит в рабочее время." }] }
      })), 700);
      return;
    }

    setLoading(true);
    try {
      const reply = await callClaude(activeAgentId, history);
      setChatState(s => ({
        ...s,
        threads: { ...s.threads, [activeAgentId]: [...(s.threads[activeAgentId] || []), { role: "assistant", content: reply }] }
      }));
    } catch (e) {
      setChatState(s => ({
        ...s,
        threads: { ...s.threads, [activeAgentId]: [...(s.threads[activeAgentId] || []), { role: "assistant", content: `⚠️ Ошибка: ${e.message}` }] }
      }));
    }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {/* Agent selector */}
      <div style={{ width: 190, borderRight: `1px solid ${C.border}`, flexShrink: 0, overflowY: "auto", padding: "8px 0" }}>
        <div style={{ padding: "4px 14px 10px", fontSize: 8, color: C.muted, letterSpacing: 2, textTransform: "uppercase" }}>Собеседники</div>
        {agents.map(a => {
          const th = threads[a.id] || [];
          const active = a.id === activeAgentId;
          return (
            <div key={a.id} onClick={() => setChatState(s => ({ ...s, activeAgentId: a.id }))}
              style={{ padding: "9px 14px", cursor: "pointer", background: active ? a.colorLo : "transparent", borderLeft: `3px solid ${active ? a.color : "transparent"}`, transition: "all 0.12s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Avatar agent={a} size={28} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: active ? a.color : C.text, fontWeight: active ? 600 : 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.name}</div>
                  <div style={{ fontSize: 8, color: C.muted }}>{th.length} сообщ.</div>
                </div>
                <StatusDot status={a.status} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Chat */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {activeAgent && (
          <div style={{ padding: "12px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
            <Avatar agent={activeAgent} size={32} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: activeAgent.color, fontSize: 13 }}>{activeAgent.name}</div>
              <div style={{ fontSize: 9, color: C.muted }}>{activeAgent.type === "ai" ? `AI агент · ${activeAgent.lastAction}` : `👨‍💻 Разработчик · ${activeAgent.lastAction}`}</div>
            </div>
          </div>
        )}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
          {thread.length === 0 && activeAgent && (
            <div style={{ textAlign: "center", padding: "48px 20px" }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>{activeAgent.initials}</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: activeAgent.color, marginBottom: 6 }}>{activeAgent.name}</div>
              <div style={{ fontSize: 11, color: C.muted, maxWidth: 260, margin: "0 auto" }}>
                {activeAgent.type === "ai" ? "Задай вопрос. Агент знает весь контекст бизнеса." : "Сообщение доставят Саше."}
              </div>
            </div>
          )}
          {thread.map((msg, i) => {
            const isUser = msg.role === "user";
            return (
              <div key={i} style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "78%", padding: "10px 14px",
                  borderRadius: isUser ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                  background: isUser ? C.accentLo : C.card,
                  border: `1px solid ${isUser ? C.accent + "40" : C.border}`,
                  fontSize: 12, color: C.text, lineHeight: 1.65, whiteSpace: "pre-wrap",
                }}>{msg.content}</div>
              </div>
            );
          })}
          {loading && (
            <div style={{ display: "flex", gap: 5, paddingLeft: 4 }}>
              {[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: activeAgent?.color, animation: `bounce 0.8s ${i * 0.15}s infinite` }} />)}
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <div style={{ padding: "12px 18px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 8, flexShrink: 0 }}>
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
            placeholder={`Написать ${activeAgent?.name || "агенту"}…`}
            style={{ flex: 1, background: C.card, border: `1px solid ${C.borderHi}`, borderRadius: 8, padding: "9px 14px", fontSize: 12, color: C.text, outline: "none", fontFamily: "inherit" }}
          />
          <button onClick={send} disabled={loading || !input.trim()}
            style={{ padding: "9px 18px", borderRadius: 8, cursor: "pointer", background: loading ? C.dim : C.accent, border: "none", color: "#fff", fontSize: 14, fontWeight: 700, opacity: !input.trim() ? 0.4 : 1, transition: "all 0.15s" }}>
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}

function ActivityView({ activities, agents }) {
  const typeIcon = { report: "📊", check: "✅", alert: "⚠️", sync: "🔄", insight: "💡", human: "👨‍💻" };
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div style={{ padding: "14px 18px 10px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>Лента активности</div>
        <div style={{ fontSize: 9, color: C.muted, marginTop: 2 }}>Что делают агенты в реальном времени</div>
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {[...activities].reverse().map(item => {
          const agent = agents.find(a => a.id === item.agent);
          if (!agent) return null;
          return (
            <div key={item.id} style={{ display: "flex", gap: 10, padding: "10px 18px", borderBottom: `1px solid ${C.dim}30` }}>
              <Avatar agent={agent} size={26} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 3 }}>
                  <span style={{ fontSize: 10, color: agent.color, fontWeight: 600 }}>{agent.name}</span>
                  <span style={{ fontSize: 8, color: C.muted }}>{item.time}</span>
                  <span style={{ fontSize: 11 }}>{typeIcon[item.type]}</span>
                </div>
                <div style={{ fontSize: 11, color: C.text, lineHeight: 1.5 }}>{item.text}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FlowsView({ agents }) {
  const sc = { live: C.green, building: C.amber, planned: C.muted };
  const sl = { live: "LIVE", building: "СТРОИМ", planned: "ПЛАН" };
  const grouped = {};
  FLOWS.forEach(f => { if (!grouped[f.agent]) grouped[f.agent] = []; grouped[f.agent].push(f); });

  return (
    <div style={{ padding: "20px 24px", overflowY: "auto", height: "100%" }}>
      <div style={{ fontWeight: 800, fontSize: 18, color: C.text, marginBottom: 4 }}>Автоматизация</div>
      <div style={{ fontSize: 11, color: C.muted, marginBottom: 20 }}>
        {FLOWS.filter(f => f.status === "live").length} активных · {FLOWS.filter(f => f.status === "building").length} строим · {FLOWS.filter(f => f.status === "planned").length} план
      </div>
      {agents.map(a => {
        const aFlows = grouped[a.id] || [];
        if (!aFlows.length) return null;
        return (
          <div key={a.id} style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Avatar agent={a} size={22} />
              <span style={{ fontSize: 11, color: a.color, fontWeight: 600 }}>{a.name}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, paddingLeft: 30 }}>
              {aFlows.map(f => (
                <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8, background: C.card, border: `1px solid ${C.border}` }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: sc[f.status], boxShadow: f.status === "live" ? `0 0 5px ${C.green}` : "none", flexShrink: 0 }} />
                  <span style={{ fontSize: 9, color: sc[f.status], fontFamily: "monospace", minWidth: 58 }}>{f.id}</span>
                  <span style={{ fontSize: 11, color: C.text, flex: 1 }}>{f.name}</span>
                  <span style={{ fontSize: 9, color: C.muted, fontFamily: "monospace" }}>⏱ {f.trigger}</span>
                  <Chip color={sc[f.status]}>{sl[f.status]}</Chip>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PromptsView({ agents, setAgents }) {
  const [activeId, setActiveId] = useState(agents[0]?.id);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saved, setSaved] = useState(false);
  const active = agents.find(a => a.id === activeId);

  const save = () => {
    const updated = agents.map(a => a.id === activeId ? { ...a, prompt: draft } : a);
    setAgents(updated);
    setEditing(false); setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    try {
      const data = {};
      updated.forEach(a => { data[a.id] = a.prompt; });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  };

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      <div style={{ width: 190, borderRight: `1px solid ${C.border}`, flexShrink: 0, overflowY: "auto", padding: "8px 0" }}>
        <div style={{ padding: "4px 14px 10px", fontSize: 8, color: C.muted, letterSpacing: 2, textTransform: "uppercase" }}>Промпты агентов</div>
        {agents.map(a => (
          <div key={a.id} onClick={() => { setActiveId(a.id); setEditing(false); }}
            style={{ padding: "9px 14px", cursor: "pointer", background: activeId === a.id ? a.colorLo : "transparent", borderLeft: `3px solid ${activeId === a.id ? a.color : "transparent"}`, transition: "all 0.12s" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Avatar agent={a} size={26} />
              <div>
                <div style={{ fontSize: 11, color: activeId === a.id ? a.color : C.text, fontWeight: 500 }}>{a.name}</div>
                <div style={{ fontSize: 8, color: C.muted }}>{a.type === "ai" ? "AI агент" : "Человек"}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {active && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <Avatar agent={active} size={32} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: active.color, fontSize: 13 }}>{active.name}</div>
              <div style={{ fontSize: 9, color: C.muted }}>{active.type === "ai" ? "System Prompt — управляет поведением AI агента" : "Описание сотрудника"}</div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {saved && <span style={{ fontSize: 10, color: C.green, animation: "fade-in 0.3s ease" }}>✓ Сохранено</span>}
              {editing ? (
                <>
                  <SmBtn color={C.red} onClick={() => setEditing(false)}>Отмена</SmBtn>
                  <SmBtn color={C.green} primary onClick={save}>💾 Сохранить</SmBtn>
                </>
              ) : (
                <SmBtn color={active.color} primary onClick={() => { setDraft(active.prompt); setEditing(true); }}>✏️ Редактировать</SmBtn>
              )}
            </div>
          </div>
          <div style={{ flex: 1, padding: "16px 20px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            {editing ? (
              <textarea value={draft} onChange={e => setDraft(e.target.value)} autoFocus
                style={{ flex: 1, background: "#030810", border: `1px solid ${active.color}50`, borderRadius: 8, padding: 16, color: C.text, fontSize: 11, fontFamily: "monospace", lineHeight: 1.7, resize: "none", outline: "none" }}
              />
            ) : (
              <div style={{ flex: 1, overflowY: "auto", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16, fontSize: 11, color: "#4a6a80", lineHeight: 1.75, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
                {active.prompt.split("\n").map((line, i) => (
                  <div key={i} style={{
                    color: line.startsWith("#") || /^[А-ЯA-Z\s]{3,}:$/.test(line.trim()) ? active.color : /^[📊🔴⚠️✅🎮👨💡📣💰]/.test(line.trim()) ? C.text : "#4a6a80",
                    marginBottom: line === "" ? 6 : 0,
                  }}>{line || "\u00A0"}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────
export default function InvestorOS() {
  const [view, setView] = useState("overview");
  const [agents, setAgents] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return AGENTS_DEFAULT.map(a => saved[a.id] ? { ...a, prompt: saved[a.id] } : a);
    } catch { return AGENTS_DEFAULT; }
  });
  const [activities, setActivities] = useState(INITIAL_ACTIVITIES);
  const [chatState, setChatState] = useState({ activeAgentId: "strategy", threads: {} });
  const [time, setTime] = useState(timeNow());
  const [ctxAge, setCtxAge] = useState(null);

  useEffect(() => { const t = setInterval(() => setTime(timeNow()), 10000); return () => clearInterval(t); }, []);

  useEffect(() => {
    const check = async () => {
      try {
        const r = await fetch("/api/health");
        const d = await r.json();
        if (d.contextAge && !d.contextAge.includes("no data")) setCtxAge(parseInt(d.contextAge));
      } catch {}
    };
    check();
    const t = setInterval(check, 300000);
    return () => clearInterval(t);
  }, []);

  // Simulate real-time activity
  useEffect(() => {
    const msgs = [
      { agent: "product",  text: "Telegram Bot: запрос /stats. Отправлен ответ с текущими KPI.", type: "check" },
      { agent: "strategy", text: "Трафик +18% vs baseline. Источник: Organic Search. Позитивный сигнал.", type: "insight" },
      { agent: "seo",      text: "Crawler проверил 10 карточек. FAQPage schema отсутствует. Список в очереди.", type: "alert" },
      { agent: "marketing",text: "3 брошенные корзины >2ч. WF-401 не активен — теряем конверсию.", type: "alert" },
      { agent: "sasha",    text: "НАЙДЕНА ПРИЧИНА: undefined kinguin_offer_id для XBOX SKU. Фиксирую.", type: "human" },
    ];
    let i = 0;
    const t = setInterval(() => {
      if (i >= msgs.length) { clearInterval(t); return; }
      const m = msgs[i++];
      setActivities(prev => [...prev, { ...m, id: Date.now(), time: timeNow() }]);
    }, 9000);
    return () => clearInterval(t);
  }, []);

  const liveCount = FLOWS.filter(f => f.status === "live").length;

  return (
    <div style={{ display: "flex", height: "100vh", background: C.bg, color: C.text, fontFamily: "'Segoe UI', system-ui, sans-serif", overflow: "hidden" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-thumb { background: #1e3558; border-radius: 2px; }
        input, textarea, button { font-family: inherit; }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.2} }
        @keyframes fade-in { from{opacity:0} to{opacity:1} }
      `}</style>

      {/* SIDEBAR */}
      <div style={{ width: 210, flexShrink: 0, background: C.surface, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "18px 16px 14px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontWeight: 800, fontSize: 17, color: C.text, letterSpacing: -0.5 }}>GG Exchange</div>
          <div style={{ fontSize: 9, color: C.muted, letterSpacing: 2, marginTop: 2, textTransform: "uppercase" }}>Investor OS</div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 10 }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.green, animation: "blink 3s infinite", boxShadow: `0 0 5px ${C.green}` }} />
            <span style={{ fontSize: 9, color: C.green }}>{liveCount} workflows live</span>
          </div>
        </div>

        <nav style={{ padding: "8px 0", flex: 1 }}>
          {NAV.map(n => (
            <div key={n.id} onClick={() => setView(n.id)} style={{
              padding: "9px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
              background: view === n.id ? C.accentLo : "transparent",
              borderLeft: `3px solid ${view === n.id ? C.accent : "transparent"}`,
              color: view === n.id ? C.accent : C.muted,
              transition: "all 0.12s",
            }}>
              <span style={{ fontSize: 13 }}>{n.icon}</span>
              <span style={{ fontSize: 12, fontWeight: view === n.id ? 600 : 400 }}>{n.label}</span>
            </div>
          ))}
        </nav>

        <div style={{ padding: "8px 0 10px", borderTop: `1px solid ${C.border}` }}>
          <div style={{ padding: "4px 16px 8px", fontSize: 8, color: C.dim, letterSpacing: 2, textTransform: "uppercase" }}>Быстрый чат</div>
          {agents.map(a => (
            <div key={a.id}
              onClick={() => { setView("chat"); setChatState(s => ({ ...s, activeAgentId: a.id })); }}
              style={{ padding: "6px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "background 0.1s" }}
              onMouseEnter={e => e.currentTarget.style.background = C.card}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <Avatar agent={a} size={22} />
              <span style={{ fontSize: 10, color: C.text, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</span>
              <StatusDot status={a.status} />
            </div>
          ))}
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ height: 46, flexShrink: 0, borderBottom: `1px solid ${C.border}`, background: C.surface, display: "flex", alignItems: "center", padding: "0 20px", gap: 12 }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: C.text }}>{NAV.find(n => n.id === view)?.label}</div>
          <div style={{ flex: 1 }} />
          <div style={{ padding: "4px 12px", borderRadius: 6, fontSize: 9, background: C.redLo, border: `1px solid ${C.red}30`, color: C.red, display: "flex", alignItems: "center", gap: 5, animation: "blink 5s infinite" }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.red }} />
            P0 · YM SHOP_FAILED 67%
          </div>
          <div style={{ fontSize: 10, color: C.muted }}>{time}</div>
        </div>
        <div style={{ flex: 1, overflow: "hidden" }}>
          {view === "overview" && <OverviewView agents={agents} />}
          {view === "chat"     && <ChatView agents={agents} chatState={chatState} setChatState={setChatState} />}
          {view === "activity" && <ActivityView activities={activities} agents={agents} />}
          {view === "flows"    && <FlowsView agents={agents} />}
          {view === "prompts"  && <PromptsView agents={agents} setAgents={setAgents} />}
        </div>
      </div>
    </div>
  );
}
