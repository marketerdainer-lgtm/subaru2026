import React, { useState, useEffect, useRef } from "react";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Send,
  Tag,
  X,
  Pencil,
  Camera,
  FileDown,
  CalendarClock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

const STORAGE_KEY = "fersautos-activities-v2";
const STATUS_KEY = "fersautos-statuses-v1";

const DEFAULT_STATUSES = [
  "Pendiente",
  "En curso",
  "Cumplido",
  "Urgente",
  "Pendiente respuesta WhatsApp",
  "Envío correo",
  "Pdte. respuesta correo",
];

const PROVIDER_TYPES = [
  "Agencia (Meta / Digital)",
  "Sede / Vitrina",
  "Encargado del evento",
  "Cadena de radio",
  "Otro",
];

const FACTURA_STATES = ["No aplica", "Pendiente", "Emitida"];

const STATUS_PALETTE = [
  { bg: "#EEF2FA", text: "#2C4A78", dot: "#3B6BC4" },
  { bg: "#EAF4EE", text: "#1F6B45", dot: "#2E9C5C" },
  { bg: "#F0EDF8", text: "#4B3B85", dot: "#7A5CC9" },
  { bg: "#FBEAEA", text: "#9C2B2B", dot: "#D64545" },
  { bg: "#FDF3E4", text: "#8A5A16", dot: "#D69A3E" },
  { bg: "#E7F3F5", text: "#255E68", dot: "#3E9AAA" },
  { bg: "#F4EFEA", text: "#6B4A34", dot: "#A97A52" },
];

const MONTHLY_REMINDERS = [
  { day: 8, text: "Legalización de gastos del mes en curso." },
  { day: 15, text: "Tener listo el plan de mercadeo del mes siguiente." },
  { day: 20, text: "Plan del mes siguiente aprobado por el gerente Juan Carlos." },
];

function seedActivities() {
  const mkDays = (planned = []) => {
    const obj = {};
    planned.forEach((d) => (obj[d] = "planned"));
    return obj;
  };
  return [
    {
      id: "a1",
      vitrina: "FERSAUTOS",
      marca: "SUBARU",
      producto: "Multiproducto",
      actividad: "SALIR",
      tipo: "Playa de ventas",
      descripcion:
        "Exhibición en C.C. Jardín Plaza — espacio para una Crosstrek Sport gasolina.",
      presupuestoProyectado: 4800000,
      presupuestoEjecutado: 0,
      proveedor: { nombre: "C.C. Jardín Plaza", tipo: "Sede / Vitrina" },
      fechaInicio: "2026-09-01",
      factura: "Pendiente",
      requiereFotos: true,
      fotosRevisadas: false,
      days: mkDays(Array.from({ length: 30 }, (_, i) => i + 1)),
      status: "Pendiente",
      comments: [],
    },
    {
      id: "a2",
      vitrina: "FERSAUTOS",
      marca: "SUBARU",
      producto: "Multiproducto",
      actividad: "DIGITAL",
      tipo: "Pauta redes sociales",
      descripcion:
        "Pauta digital Crosstrek Sport; Crosstrek Premium $500; Evoltis $500.",
      presupuestoProyectado: 1500000,
      presupuestoEjecutado: 0,
      proveedor: { nombre: "Agencia de pauta digital", tipo: "Agencia (Meta / Digital)" },
      fechaInicio: "2026-09-01",
      factura: "Pendiente",
      requiereFotos: false,
      fotosRevisadas: false,
      days: mkDays(Array.from({ length: 30 }, (_, i) => i + 1)),
      status: "Pendiente",
      comments: [],
    },
    {
      id: "a3",
      vitrina: "FERSAUTOS",
      marca: "SUBARU",
      producto: "Multiproducto",
      actividad: "DIGITAL",
      tipo: "Pauta redes sociales",
      descripcion:
        "Pauta digital con enfoque a agendamiento de test drive en registro de formulario — Forester Turing.",
      presupuestoProyectado: 500000,
      presupuestoEjecutado: 0,
      proveedor: { nombre: "Agencia de pauta digital", tipo: "Agencia (Meta / Digital)" },
      fechaInicio: "2026-09-01",
      factura: "Pendiente",
      requiereFotos: false,
      fotosRevisadas: false,
      days: mkDays(Array.from({ length: 30 }, (_, i) => i + 1)),
      status: "Pendiente",
      comments: [],
    },
    {
      id: "a4",
      vitrina: "FERSAUTOS",
      marca: "SUBARU",
      producto: "Multiproducto",
      actividad: "DIGITAL",
      tipo: "Pauta en radio",
      descripcion:
        "Pauta en radio para promociones del mes y ubicación de la nueva vitrina.",
      presupuestoProyectado: 500000,
      presupuestoEjecutado: 0,
      proveedor: { nombre: "Cadena de radio", tipo: "Cadena de radio" },
      fechaInicio: "2026-09-01",
      factura: "Pendiente",
      requiereFotos: false,
      fotosRevisadas: false,
      days: mkDays([]),
      status: "Pendiente",
      comments: [],
    },
    {
      id: "a6",
      vitrina: "FERSAUTOS",
      marca: "SUBARU",
      producto: "Multiproducto",
      actividad: "SALIR",
      tipo: "Playa de ventas",
      descripcion:
        "Playa de ventas Lomitas 17 y 18, plazoleta San Diego — un espacio y activación de Amor y Amistad (GWM).",
      presupuestoProyectado: 402500,
      presupuestoEjecutado: 0,
      proveedor: { nombre: "Encargado del evento Lomitas", tipo: "Encargado del evento" },
      fechaInicio: "2026-09-17",
      factura: "Pendiente",
      requiereFotos: true,
      fotosRevisadas: false,
      days: mkDays([17, 18, 22, 23]),
      status: "Pendiente",
      comments: [],
    },
  ];
}

// Migra registros guardados con el formato viejo (array de 31 posiciones) al nuevo formato (objeto por día).
function migrateActivity(a) {
  let days = a.days;
  if (Array.isArray(days)) {
    const obj = {};
    days.forEach((state, i) => {
      if (state && state !== "none") obj[i + 1] = state;
    });
    days = obj;
  }
  return {
    proveedor: { nombre: "", tipo: PROVIDER_TYPES[0] },
    fechaInicio: "",
    factura: "No aplica",
    requiereFotos: false,
    fotosRevisadas: false,
    presupuestoProyectado: a.presupuesto || 0,
    presupuestoEjecutado: 0,
    ...a,
    days: days || {},
  };
}

const money = (n) =>
  "$ " + Number(n || 0).toLocaleString("es-CO", { maximumFractionDigits: 0 });

function statusStyle(status, statusList) {
  const idx = Math.max(0, statusList.indexOf(status));
  return STATUS_PALETTE[idx % STATUS_PALETTE.length];
}

function getMonthMeta() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay();
  const label = now.toLocaleDateString("es-CO", { month: "long", year: "numeric" });
  return { year, month, daysInMonth, firstWeekday, today: now.getDate(), label };
}

function DayCell({ state, isToday, onClick }) {
  let style = { background: "#fff", border: "1px solid #DDE2EA", color: "#9AA3B2" };
  if (state === "planned")
    style = { background: "#fff", border: "1.5px solid #3B6BC4", color: "#3B6BC4" };
  if (state === "done")
    style = { background: "#2E9C5C", border: "1.5px solid #2E9C5C", color: "#fff" };
  return (
    <button
      onClick={onClick}
      style={{
        width: 26,
        height: 26,
        borderRadius: 6,
        fontSize: 10,
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        position: "relative",
        boxShadow: isToday ? "0 0 0 2px #D69A3E" : "none",
        ...style,
      }}
    />
  );
}

function MonthCalendar({ days, onToggleDay }) {
  const { daysInMonth, firstWeekday, today, label } = getMonthMeta();
  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const plannedCount = Object.values(days).filter((s) => s !== "none").length;
  const doneCount = Object.values(days).filter((s) => s === "done").length;
  const progress = plannedCount ? Math.round((doneCount / plannedCount) * 100) : 0;

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#7A8496", marginBottom: 8, textTransform: "capitalize" }}>
        {label} {plannedCount > 0 && `· ${progress}% confirmado`}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 26px)", gap: 4, marginBottom: 4 }}>
        {["D", "L", "M", "M", "J", "V", "S"].map((d, i) => (
          <div key={i} style={{ fontSize: 10, color: "#B0B7C3", textAlign: "center", fontWeight: 700 }}>
            {d}
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 26px)", gap: 4 }}>
        {cells.map((d, i) =>
          d === null ? (
            <div key={i} />
          ) : (
            <DayCell
              key={i}
              state={days[d] || "none"}
              isToday={d === today}
              onClick={() => onToggleDay(d)}
            />
          )
        )}
      </div>
      <div style={{ fontSize: 11, color: "#9AA3B2", marginTop: 8, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, border: "1.5px solid #3B6BC4", marginRight: 4 }} />Planificado</span>
        <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: "#2E9C5C", marginRight: 4 }} />Confirmado</span>
        <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, boxShadow: "0 0 0 2px #D69A3E", marginRight: 4 }} />Hoy</span>
      </div>
    </div>
  );
}

const inputStyle = {
  fontSize: 13,
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid #DDE2EA",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};
const labelStyle = { fontSize: 11, fontWeight: 600, color: "#7A8496", marginBottom: 4, display: "block" };

function ActivityForm({ initial, onSave, onCancel, defaultStatus }) {
  const [form, setForm] = useState(
    initial || {
      marca: "",
      actividad: "SALIR",
      tipo: "",
      descripcion: "",
      presupuestoProyectado: "",
      presupuestoEjecutado: "",
      proveedor: { nombre: "", tipo: PROVIDER_TYPES[0] },
      fechaInicio: "",
      factura: "No aplica",
      requiereFotos: false,
      fotosRevisadas: false,
      status: defaultStatus,
    }
  );

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const setProv = (field, value) =>
    setForm((f) => ({ ...f, proveedor: { ...f.proveedor, [field]: value } }));

  const submit = () => {
    if (!form.descripcion.trim()) return;
    onSave({
      ...form,
      marca: form.marca || "Sin marca",
      tipo: form.tipo || "General",
      presupuestoProyectado: Number(form.presupuestoProyectado) || 0,
      presupuestoEjecutado: Number(form.presupuestoEjecutado) || 0,
    });
  };

  return (
    <div style={{ background: "#FAFBFD", border: "1px solid #E4E7EE", borderRadius: 12, padding: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#1C2333", marginBottom: 12 }}>
        {initial ? "Editar actividad" : "Nueva actividad"}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <label style={labelStyle}>Marca</label>
          <input style={inputStyle} placeholder="Ej: SUBARU" value={form.marca} onChange={(e) => set("marca", e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Tipo de actividad</label>
          <select style={inputStyle} value={form.actividad} onChange={(e) => set("actividad", e.target.value)}>
            <option value="SALIR">SALIR</option>
            <option value="DIGITAL">DIGITAL</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Tipo</label>
          <input style={inputStyle} placeholder="Ej: Playa de ventas" value={form.tipo} onChange={(e) => set("tipo", e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Fecha de inicio</label>
          <input style={inputStyle} type="date" value={form.fechaInicio} onChange={(e) => set("fechaInicio", e.target.value)} />
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <label style={labelStyle}>Descripción</label>
          <textarea style={{ ...inputStyle, minHeight: 55 }} placeholder="Descripción detallada" value={form.descripcion} onChange={(e) => set("descripcion", e.target.value)} />
        </div>

        <div>
          <label style={labelStyle}>Presupuesto proyectado (plan de mercadeo)</label>
          <input style={inputStyle} type="number" placeholder="$" value={form.presupuestoProyectado} onChange={(e) => set("presupuestoProyectado", e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Presupuesto realmente ejecutado</label>
          <input style={inputStyle} type="number" placeholder="$" value={form.presupuestoEjecutado} onChange={(e) => set("presupuestoEjecutado", e.target.value)} />
        </div>

        <div>
          <label style={labelStyle}>Proveedor</label>
          <input style={inputStyle} placeholder="Nombre del proveedor / agencia / sede" value={form.proveedor.nombre} onChange={(e) => setProv("nombre", e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Tipo de proveedor</label>
          <select style={inputStyle} value={form.proveedor.tipo} onChange={(e) => setProv("tipo", e.target.value)}>
            {PROVIDER_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Factura</label>
          <select style={inputStyle} value={form.factura} onChange={(e) => set("factura", e.target.value)}>
            {FACTURA_STATES.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 14, paddingBottom: 8 }}>
          <label style={{ fontSize: 12, color: "#3B4A63", display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
            <input type="checkbox" checked={form.requiereFotos} onChange={(e) => set("requiereFotos", e.target.checked)} />
            Requiere fotos
          </label>
          {form.requiereFotos && (
            <label style={{ fontSize: 12, color: "#3B4A63", display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <input type="checkbox" checked={form.fotosRevisadas} onChange={(e) => set("fotosRevisadas", e.target.checked)} />
              Fotos revisadas
            </label>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 14, justifyContent: "flex-end" }}>
        <button onClick={onCancel} style={{ fontSize: 12, padding: "7px 14px", borderRadius: 8, border: "1px solid #DDE2EA", background: "#fff", cursor: "pointer" }}>
          Cancelar
        </button>
        <button onClick={submit} style={{ fontSize: 12, padding: "7px 14px", borderRadius: 8, border: "none", background: "#3B6BC4", color: "#fff", cursor: "pointer" }}>
          Guardar
        </button>
      </div>
    </div>
  );
}

function ActivityCard({ activity, statusList, isOpen, onToggle, onUpdate, onDelete }) {
  const [commentText, setCommentText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const st = statusStyle(activity.status, statusList);

  const diff = activity.presupuestoEjecutado - activity.presupuestoProyectado;
  const yaEjecuto = activity.presupuestoEjecutado > 0;

  const toggleDay = (day) => {
    const next = { none: "planned", planned: "done", done: "none" };
    const current = activity.days[day] || "none";
    const nextState = next[current];
    const days = { ...activity.days };
    if (nextState === "none") delete days[day];
    else days[day] = nextState;
    onUpdate({ ...activity, days });
  };

  const addComment = () => {
    if (!commentText.trim()) return;
    const c = {
      id: Date.now().toString(),
      date: new Date().toLocaleString("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }),
      text: commentText.trim(),
    };
    onUpdate({ ...activity, comments: [c, ...activity.comments] });
    setCommentText("");
  };

  const removeComment = (id) =>
    onUpdate({ ...activity, comments: activity.comments.filter((c) => c.id !== id) });

  if (isEditing) {
    return (
      <div style={{ marginBottom: 12 }}>
        <ActivityForm
          initial={activity}
          onSave={(updated) => {
            onUpdate({ ...activity, ...updated });
            setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div style={{ background: "#fff", border: "1px solid #E4E7EE", borderRadius: 12, marginBottom: 12, overflow: "hidden" }}>
      <div onClick={onToggle} style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#3B4A63", background: "#EEF1F6", padding: "2px 8px", borderRadius: 20 }}>
              {activity.marca}
            </span>
            <span style={{ fontSize: 11, color: "#7A8496" }}>{activity.actividad} · {activity.tipo}</span>
            {activity.requiereFotos && !activity.fotosRevisadas && (
              <span style={{ fontSize: 11, color: "#9C2B2B", display: "flex", alignItems: "center", gap: 3 }}>
                <Camera size={12} /> Revisar fotos
              </span>
            )}
          </div>
          <div style={{ fontSize: 14, color: "#1C2333", marginTop: 4, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: isOpen ? "normal" : "nowrap" }}>
            {activity.descripcion}
          </div>
          {activity.proveedor?.nombre && (
            <div style={{ fontSize: 11.5, color: "#9AA3B2", marginTop: 2 }}>
              Proveedor: {activity.proveedor.nombre} ({activity.proveedor.tipo})
            </div>
          )}
        </div>

        <div style={{ textAlign: "right", fontSize: 13, color: "#3B4A63", fontWeight: 600, whiteSpace: "nowrap" }}>
          {money(activity.presupuestoProyectado)}
          <div style={{ fontSize: 10.5, fontWeight: 600, color: yaEjecuto ? (diff > 0 ? "#D64545" : "#2E9C5C") : "#B0B7C3" }}>
            {yaEjecuto ? `Ejecutado ${money(activity.presupuestoEjecutado)}` : "Sin ejecutar aún"}
          </div>
        </div>

        <select
          value={activity.status}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onUpdate({ ...activity, status: e.target.value })}
          style={{ fontSize: 12, fontWeight: 600, padding: "5px 10px", borderRadius: 20, border: "none", background: st.bg, color: st.text, cursor: "pointer" }}
        >
          {statusList.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {isOpen ? <ChevronUp size={18} color="#7A8496" /> : <ChevronDown size={18} color="#7A8496" />}
      </div>

      {isOpen && (
        <div style={{ padding: "0 16px 18px 16px", borderTop: "1px solid #EEF0F4" }}>
          <div style={{ display: "flex", gap: 24, marginTop: 16, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 280px" }}>
              <MonthCalendar days={activity.days} onToggleDay={toggleDay} />
            </div>

            <div style={{ flex: "1 1 280px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#7A8496", marginBottom: 8 }}>
                Presupuesto y proveedor
              </div>
              <div style={{ fontSize: 12.5, color: "#334", lineHeight: 1.8 }}>
                <div>Proyectado: <b>{money(activity.presupuestoProyectado)}</b></div>
                <div>Ejecutado: <b>{yaEjecuto ? money(activity.presupuestoEjecutado) : "Pendiente"}</b></div>
                {yaEjecuto && (
                  <div style={{ color: diff > 0 ? "#D64545" : "#2E9C5C" }}>
                    {diff > 0 ? `Sobre lo proyectado en ${money(diff)}` : diff < 0 ? `Por debajo de lo proyectado en ${money(-diff)}` : "Igual a lo proyectado"}
                  </div>
                )}
                <div>Proveedor: <b>{activity.proveedor?.nombre || "Sin definir"}</b> ({activity.proveedor?.tipo})</div>
                <div>Fecha inicio: <b>{activity.fechaInicio || "Sin definir"}</b></div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  Factura: <b>{activity.factura}</b>
                  {activity.factura === "Emitida" && <CheckCircle2 size={13} color="#2E9C5C" />}
                  {activity.factura === "Pendiente" && <AlertTriangle size={13} color="#D69A3E" />}
                </div>
                {activity.requiereFotos && (
                  <div>Fotos del evento: <b>{activity.fotosRevisadas ? "Revisadas" : "Pendientes de revisar"}</b></div>
                )}
              </div>

              <div style={{ fontSize: 11, fontWeight: 700, color: "#7A8496", margin: "14px 0 8px" }}>
                Bitácora de seguimiento
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addComment()}
                  placeholder="Ej: se contactó al proveedor vía WhatsApp, queda pendiente respuesta"
                  style={{ flex: 1, fontSize: 13, padding: "8px 10px", borderRadius: 8, border: "1px solid #DDE2EA", outline: "none" }}
                />
                <button onClick={addComment} style={{ background: "#3B6BC4", border: "none", borderRadius: 8, padding: "0 12px", cursor: "pointer", display: "flex", alignItems: "center" }}>
                  <Send size={14} color="#fff" />
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 150, overflowY: "auto" }}>
                {activity.comments.length === 0 && (
                  <div style={{ fontSize: 12, color: "#B0B7C3" }}>Sin gestiones registradas todavía.</div>
                )}
                {activity.comments.map((c) => (
                  <div key={c.id} style={{ background: "#F7F8FA", borderRadius: 8, padding: "7px 10px", fontSize: 12.5, color: "#334", display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <div><span style={{ color: "#8A93A3", fontWeight: 600 }}>{c.date} — </span>{c.text}</div>
                    <button onClick={() => removeComment(c.id)} style={{ border: "none", background: "none", cursor: "pointer", color: "#C7CCD6", flexShrink: 0 }}>
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 16, marginTop: 16, alignItems: "center" }}>
            <button onClick={() => setIsEditing(true)} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#3B6BC4", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              <Pencil size={13} /> Editar actividad
            </button>

            {!confirmingDelete ? (
              <button onClick={() => setConfirmingDelete(true)} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#B0463E", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                <Trash2 size={13} /> Eliminar actividad
              </button>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                <span style={{ color: "#B0463E" }}>¿Eliminar esta actividad?</span>
                <button onClick={() => onDelete(activity.id)} style={{ border: "none", background: "#D64545", color: "#fff", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}>Sí, eliminar</button>
                <button onClick={() => setConfirmingDelete(false)} style={{ border: "1px solid #DDE2EA", background: "#fff", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}>Cancelar</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function downloadCSV(activities) {
  const headers = [
    "Marca", "Actividad", "Tipo", "Descripción", "Proveedor", "Tipo proveedor",
    "Fecha inicio", "Presupuesto proyectado", "Presupuesto ejecutado", "Diferencia",
    "Factura", "Fotos revisadas", "Estado", "% calendario confirmado",
  ];
  const rows = activities.map((a) => {
    const plannedCount = Object.values(a.days).filter((s) => s !== "none").length;
    const doneCount = Object.values(a.days).filter((s) => s === "done").length;
    const pct = plannedCount ? Math.round((doneCount / plannedCount) * 100) : 0;
    const diff = a.presupuestoEjecutado - a.presupuestoProyectado;
    return [
      a.marca, a.actividad, a.tipo, a.descripcion.replace(/"/g, "'"),
      a.proveedor?.nombre || "", a.proveedor?.tipo || "", a.fechaInicio || "",
      a.presupuestoProyectado, a.presupuestoEjecutado || 0, diff,
      a.factura, a.requiereFotos ? (a.fotosRevisadas ? "Sí" : "Pendiente") : "N/A",
      a.status, `${pct}%`,
    ];
  });
  const csv = [headers, ...rows]
    .map((r) => r.map((v) => `"${v}"`).join(","))
    .join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `fersautos-informe-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function FersautosTracker() {
  const [activities, setActivities] = useState([]);
  const [statusList, setStatusList] = useState(DEFAULT_STATUSES);
  const [loaded, setLoaded] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [showStatusEditor, setShowStatusEditor] = useState(false);
  const [filter, setFilter] = useState("Todas");
  const [showReminders, setShowReminders] = useState(true);
  const saveTimer = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const a = await window.storage.get(STORAGE_KEY);
        setActivities(a ? JSON.parse(a.value).map(migrateActivity) : seedActivities());
      } catch {
        setActivities(seedActivities());
      }
      try {
        const s = await window.storage.get(STATUS_KEY);
        setStatusList(s ? JSON.parse(s.value) : DEFAULT_STATUSES);
      } catch {
        setStatusList(DEFAULT_STATUSES);
      }
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await window.storage.set(STORAGE_KEY, JSON.stringify(activities));
      } catch (e) {
        console.error("No se pudo guardar", e);
      }
    }, 400);
  }, [activities, loaded]);

  useEffect(() => {
    if (!loaded) return;
    (async () => {
      try {
        await window.storage.set(STATUS_KEY, JSON.stringify(statusList));
      } catch (e) {
        console.error("No se pudo guardar", e);
      }
    })();
  }, [statusList, loaded]);

  const updateActivity = (updated) =>
    setActivities((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));

  const deleteActivity = (id) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
    if (openId === id) setOpenId(null);
  };

  const addStatus = () => {
    const v = newStatus.trim();
    if (v && !statusList.includes(v)) setStatusList([...statusList, v]);
    setNewStatus("");
  };

  const removeStatus = (s) => {
    if (statusList.length <= 1) return;
    setStatusList(statusList.filter((x) => x !== s));
  };

  const totalProyectado = activities.reduce((sum, a) => sum + (Number(a.presupuestoProyectado) || 0), 0);
  const totalEjecutado = activities.reduce((sum, a) => sum + (Number(a.presupuestoEjecutado) || 0), 0);
  const counts = statusList.reduce((acc, s) => {
    acc[s] = activities.filter((a) => a.status === s).length;
    return acc;
  }, {});
  const pendientesFotos = activities.filter((a) => a.requiereFotos && !a.fotosRevisadas).length;

  const visible = filter === "Todas" ? activities : activities.filter((a) => a.status === filter);
  const { today } = getMonthMeta();

  if (!loaded) {
    return <div style={{ padding: 40, fontFamily: "Inter, sans-serif", color: "#7A8496", fontSize: 13 }}>Cargando seguimiento…</div>;
  }

  return (
    <div style={{ fontFamily: "Inter, -apple-system, sans-serif", background: "#F7F8FA", minHeight: "100%", padding: "24px 20px" }}>
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#1C2333" }}>Seguimiento de actividades — Fersautos</div>
            <div style={{ fontSize: 13, color: "#7A8496", marginTop: 2 }}>
              Dainer Taboada · Analista de mercadeo. Control de ejecución, presupuesto y proveedores. Todo se guarda automáticamente.
            </div>
          </div>
          <button
            onClick={() => downloadCSV(activities)}
            style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, padding: "8px 14px", borderRadius: 8, border: "1px solid #3B6BC4", background: "#fff", color: "#3B6BC4", cursor: "pointer", whiteSpace: "nowrap" }}
          >
            <FileDown size={14} /> Descargar informe (.csv)
          </button>
        </div>

        {showReminders && (
          <div style={{ background: "#FDF3E4", border: "1px solid #F0DDB5", borderRadius: 10, padding: "12px 14px", marginBottom: 16, display: "flex", gap: 10, alignItems: "flex-start" }}>
            <CalendarClock size={16} color="#8A5A16" style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ flex: 1, fontSize: 12.5, color: "#8A5A16" }}>
              <b>Recordatorios del mes</b> — hoy es el día {today}.
              <ul style={{ margin: "4px 0 0", paddingLeft: 18 }}>
                {MONTHLY_REMINDERS.map((r) => (
                  <li key={r.day}>Día {r.day}: {r.text}</li>
                ))}
              </ul>
            </div>
            <button onClick={() => setShowReminders(false)} style={{ border: "none", background: "none", cursor: "pointer", color: "#8A5A16", flexShrink: 0 }}>
              <X size={14} />
            </button>
          </div>
        )}

        <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
          <div style={{ background: "#fff", border: "1px solid #E4E7EE", borderRadius: 10, padding: "10px 16px", minWidth: 120 }}>
            <div style={{ fontSize: 11, color: "#7A8496", fontWeight: 600 }}>Actividades</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#1C2333" }}>{activities.length}</div>
          </div>
          <div style={{ background: "#fff", border: "1px solid #E4E7EE", borderRadius: 10, padding: "10px 16px", minWidth: 150 }}>
            <div style={{ fontSize: 11, color: "#7A8496", fontWeight: 600 }}>Proyectado total</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#1C2333" }}>{money(totalProyectado)}</div>
          </div>
          <div style={{ background: "#fff", border: "1px solid #E4E7EE", borderRadius: 10, padding: "10px 16px", minWidth: 150 }}>
            <div style={{ fontSize: 11, color: "#7A8496", fontWeight: 600 }}>Ejecutado total</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: totalEjecutado > totalProyectado ? "#D64545" : "#1C2333" }}>{money(totalEjecutado)}</div>
          </div>
          {pendientesFotos > 0 && (
            <div style={{ background: "#FBEAEA", borderRadius: 10, padding: "10px 16px", minWidth: 150 }}>
              <div style={{ fontSize: 11, color: "#9C2B2B", fontWeight: 600 }}>Fotos por revisar</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#9C2B2B" }}>{pendientesFotos}</div>
            </div>
          )}
          {statusList.slice(0, 3).map((s) => {
            const st = statusStyle(s, statusList);
            return (
              <div key={s} style={{ background: st.bg, borderRadius: 10, padding: "10px 16px", minWidth: 110 }}>
                <div style={{ fontSize: 11, color: st.text, fontWeight: 600 }}>{s}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: st.text }}>{counts[s] || 0}</div>
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
          <button
            onClick={() => setFilter("Todas")}
            style={{ fontSize: 12, fontWeight: 600, padding: "6px 12px", borderRadius: 20, cursor: "pointer", border: filter === "Todas" ? "1px solid #3B6BC4" : "1px solid #DDE2EA", background: filter === "Todas" ? "#EEF2FA" : "#fff", color: filter === "Todas" ? "#3B6BC4" : "#5B6577" }}
          >
            Todas ({activities.length})
          </button>
          {statusList.map((s) => {
            const st = statusStyle(s, statusList);
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                style={{ fontSize: 12, fontWeight: 600, padding: "6px 12px", borderRadius: 20, cursor: "pointer", border: filter === s ? `1px solid ${st.dot}` : "1px solid #DDE2EA", background: filter === s ? st.bg : "#fff", color: filter === s ? st.text : "#5B6577" }}
              >
                {s} ({counts[s] || 0})
              </button>
            );
          })}
          <button onClick={() => setShowStatusEditor(!showStatusEditor)} style={{ fontSize: 12, color: "#7A8496", background: "none", border: "none", cursor: "pointer", marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
            <Tag size={13} /> Gestionar estados
          </button>
        </div>

        {showStatusEditor && (
          <div style={{ background: "#fff", border: "1px solid #E4E7EE", borderRadius: 10, padding: 12, marginBottom: 14 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
              {statusList.map((s) => (
                <span key={s} style={{ fontSize: 12, background: "#F1F3F7", padding: "4px 8px", borderRadius: 20, display: "flex", alignItems: "center", gap: 6 }}>
                  {s}
                  <X size={11} style={{ cursor: "pointer" }} onClick={() => removeStatus(s)} />
                </span>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addStatus()}
                placeholder="Nuevo estado personalizado"
                style={{ flex: 1, fontSize: 12, padding: "6px 10px", borderRadius: 8, border: "1px solid #DDE2EA", outline: "none" }}
              />
              <button onClick={addStatus} style={{ fontSize: 12, padding: "6px 12px", borderRadius: 8, border: "none", background: "#3B6BC4", color: "#fff", cursor: "pointer" }}>
                Agregar
              </button>
            </div>
          </div>
        )}

        {visible.map((a) => (
          <ActivityCard
            key={a.id}
            activity={a}
            statusList={statusList}
            isOpen={openId === a.id}
            onToggle={() => setOpenId(openId === a.id ? null : a.id)}
            onUpdate={updateActivity}
            onDelete={deleteActivity}
          />
        ))}

        {showAdd ? (
          <ActivityForm
            defaultStatus={statusList[0]}
            onSave={(act) => {
              setActivities((p) => [
                ...p,
                { id: Date.now().toString(), vitrina: "FERSAUTOS", producto: "Multiproducto", comments: [], days: {}, status: statusList[0], ...act },
              ]);
              setShowAdd(false);
            }}
            onCancel={() => setShowAdd(false)}
          />
        ) : (
          <button
            onClick={() => setShowAdd(true)}
            style={{ width: "100%", padding: "12px", borderRadius: 12, border: "1.5px dashed #C7CCD6", background: "#fff", color: "#5B6577", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 4 }}
          >
            <Plus size={15} /> Agregar actividad
          </button>
        )}
      </div>
    </div>
  );
}
