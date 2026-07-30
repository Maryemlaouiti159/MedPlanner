import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { secretaryAppointmentsApi } from "../../api/secretaryAppointments";
import { secretaryAvailabilitiesApi } from "../../api/secretaryAvailabilities";
import type { Availability } from "../../types";

interface Appointment {
  id: number;
  patient: {
    first_name: string;
    last_name: string;
  };
  doctor?: {
    name: string;
    specialty: string;
  };
  availability: {
    id: number;
    date: string;
    start_time: string;
  };
  status: string;
  reason?: string;
}

const FILTERS: [string, string][] = [
  ["all", "Tous"],
  ["confirmed", "Confirmé"],
  ["pending", "En attente"],
  ["cancelled", "Annulé"],
];

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  confirmed: { label: "Confirmé", className: "confirmed" },
  pending: { label: "En attente", className: "pending" },
  cancelled: { label: "Annulé", className: "cancelled" },
};

const AVATAR_COLORS = ["#0f9b8e", "#4f46e5", "#d97706", "#dc2626", "#7c3aed", "#0891b2"];

function avatarColor(name: string) {
  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function SecretaryAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // Actions en cours (pour désactiver les boutons et éviter les double-clics)
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // ---------- Modale Reprogrammer / Modifier ----------
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [availabilitiesLoading, setAvailabilitiesLoading] = useState(false);
  const [selectedAvailabilityId, setSelectedAvailabilityId] = useState<number | null>(null);
  const [rescheduleSaving, setRescheduleSaving] = useState(false);
  const [rescheduleError, setRescheduleError] = useState("");

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = () => {
    setLoading(true);
    secretaryAppointmentsApi
      .get()
      .then((res) => setAppointments(res.data))
      .catch(() => alert("Impossible de charger les rendez-vous."))
      .finally(() => setLoading(false));
  };

  const confirmAppointment = async (id: number) => {
    setActionLoadingId(id);
    try {
      await secretaryAppointmentsApi.confirm(id);
      loadAppointments();
    } catch (err: any) {
      alert(err.response?.data?.message ?? "Erreur lors de la confirmation.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const cancelAppointment = async (id: number) => {
    if (!confirm("Annuler ce rendez-vous ?")) return;
    setActionLoadingId(id);
    try {
      await secretaryAppointmentsApi.cancel(id);
      loadAppointments();
    } catch (err: any) {
      alert(err.response?.data?.message ?? "Erreur lors de l'annulation.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // ---------- Reprogrammer / Modifier ----------
  const openRescheduleModal = (appt: Appointment) => {
    setRescheduleTarget(appt);
    setSelectedAvailabilityId(null);
    setRescheduleError("");
    setAvailabilitiesLoading(true);

    secretaryAvailabilitiesApi
      .list()
      .then((res) => setAvailabilities(res.data))
      .catch(() => setRescheduleError("Impossible de charger les créneaux disponibles."))
      .finally(() => setAvailabilitiesLoading(false));
  };

  const closeRescheduleModal = () => {
    if (rescheduleSaving) return;
    setRescheduleTarget(null);
    setAvailabilities([]);
    setSelectedAvailabilityId(null);
    setRescheduleError("");
  };

  const confirmReschedule = async () => {
    if (!rescheduleTarget || !selectedAvailabilityId) return;
    setRescheduleSaving(true);
    setRescheduleError("");

    try {
      await secretaryAppointmentsApi.reschedule(rescheduleTarget.id, selectedAvailabilityId);
      closeRescheduleModal();
      loadAppointments();
    } catch (err: any) {
      setRescheduleError(err.response?.data?.message ?? "Erreur lors de la reprogrammation.");
    } finally {
      setRescheduleSaving(false);
    }
  };

  // Créneaux sélectionnables : libres uniquement (ni réservés, ni bloqués)
  const selectableAvailabilities = availabilities.filter(
    (slot) => !slot.is_booked && !slot.is_blocked
  );

  const filteredAppointments = appointments.filter((rdv) => {
    const name = `${rdv.patient.first_name} ${rdv.patient.last_name}`;
    const doctorName = rdv.doctor?.name ?? "";
    const matchesSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      doctorName.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || rdv.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <DashboardLayout>
      <div className="secretary-page">
        {/* HEADER */}
        <div className="secretary-header">
          <div>
            <h1>Gestion des rendez-vous</h1>
            <p>Créer, modifier, confirmer ou annuler les rendez-vous</p>
          </div>
        </div>

        {/* SEARCH + FILTER */}
        <div className="appointment-toolbar">
          <div className="search-pill">
            <span className="search-icon">🔍</span>
            <input
              placeholder="Rechercher patient, médecin..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filters">
            {FILTERS.map(([key, label]) => (
              <button
                key={key}
                className={filter === key ? "active-filter" : ""}
                onClick={() => setFilter(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* TABLE */}
        <div className="appointment-table">
          <div className="table-head">
            <span>PATIENT</span>
            <span>MÉDECIN</span>
            <span>SPÉCIALITÉ</span>
            <span>DATE</span>
            <span>HEURE</span>
            <span>STATUT</span>
            <span className="actions-head">ACTIONS</span>
          </div>

          {loading && <div className="table-empty">Chargement...</div>}

          {!loading && filteredAppointments.length === 0 && (
            <div className="table-empty">Aucun rendez-vous trouvé.</div>
          )}

          {!loading &&
            filteredAppointments.map((rdv) => {
              const fullName = `${rdv.patient.first_name} ${rdv.patient.last_name}`;
              const status = STATUS_CONFIG[rdv.status] ?? {
                label: rdv.status,
                className: "",
              };
              const isBusy = actionLoadingId === rdv.id;

              return (
                <div className="table-row" key={rdv.id}>
                  <span className="patient-name">
                    <div className="avatar" style={{ background: avatarColor(fullName) }}>
                      {rdv.patient.first_name[0]}
                      {rdv.patient.last_name[0]}
                    </div>

                    <span className="patient-name-text">{fullName}</span>
                  </span>

                  <span>{rdv.doctor?.name ?? "—"}</span>
                  <span>{rdv.doctor?.specialty ?? "—"}</span>
                  <span>{formatDate(rdv.availability.date)}</span>
                  <span>{rdv.availability.start_time.slice(0, 5)}</span>

                  <span>
                    <span className={`status ${status.className}`}>
                      {status.className === "confirmed" && "✓ "}
                      {status.className === "pending" && "◉ "}
                      {status.className === "cancelled" && "× "}
                      {status.label}
                    </span>
                  </span>

                  <span className="actions">
                    {rdv.status === "pending" && (
                      <button
                        className="action-btn confirm"
                        title="Confirmer"
                        disabled={isBusy}
                        onClick={() => confirmAppointment(rdv.id)}
                      >
                        ✓
                      </button>
                    )}

                    {rdv.status !== "cancelled" && (
                      <button
                        className="action-btn refresh"
                        title="Reprogrammer"
                        disabled={isBusy}
                        onClick={() => openRescheduleModal(rdv)}
                      >
                        ↻
                      </button>
                    )}

                  

                    {rdv.status !== "cancelled" && (
                      <button
                        className="action-btn cancel"
                        title="Annuler"
                        disabled={isBusy}
                        onClick={() => cancelAppointment(rdv.id)}
                      >
                        ✕
                      </button>
                    )}
                  </span>
                </div>
              );
            })}
        </div>
      </div>

      {/* ---------- Modale Reprogrammer / Modifier ---------- */}
      {rescheduleTarget && (
        <div
          onClick={closeRescheduleModal}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--card, white)",
              borderRadius: 16,
              padding: 24,
              width: "100%",
              maxWidth: 420,
              maxHeight: "80vh",
              overflowY: "auto",
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
            }}
          >
            <h3 style={{ margin: "0 0 6px 0", fontSize: 17, fontWeight: 700 }}>
              Reprogrammer le rendez-vous
            </h3>
            <p style={{ fontSize: 13.5, color: "#6b7280", margin: "0 0 18px 0" }}>
              {rescheduleTarget.patient.first_name} {rescheduleTarget.patient.last_name} —{" "}
              {formatDate(rescheduleTarget.availability.date)} à{" "}
              {rescheduleTarget.availability.start_time.slice(0, 5)}
            </p>

            {availabilitiesLoading ? (
              <div style={{ padding: 20, textAlign: "center", color: "#6b7280" }}>
                Chargement des créneaux...
              </div>
            ) : selectableAvailabilities.length === 0 ? (
              <div style={{ padding: 20, textAlign: "center", color: "#6b7280" }}>
                Aucun créneau libre disponible pour ce médecin.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 280, overflowY: "auto" }}>
                {selectableAvailabilities.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedAvailabilityId(slot.id)}
                    style={{
                      textAlign: "left",
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: selectedAvailabilityId === slot.id ? "2px solid #2563eb" : "1px solid #e5e7eb",
                      background: selectedAvailabilityId === slot.id ? "rgba(37, 99, 235, 0.06)" : "white",
                      cursor: "pointer",
                      fontSize: 13.5,
                      fontWeight: 600,
                    }}
                  >
                    {formatDate(slot.date)} — {slot.start_time.slice(0, 5)}
                  </button>
                ))}
              </div>
            )}

            {rescheduleError && (
              <p style={{ color: "#dc2626", fontSize: 13, marginTop: 14 }}>{rescheduleError}</p>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
              <button
                onClick={closeRescheduleModal}
                disabled={rescheduleSaving}
                style={{
                  padding: "9px 16px",
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                  background: "white",
                  fontWeight: 600,
                  fontSize: 13.5,
                  cursor: rescheduleSaving ? "not-allowed" : "pointer",
                }}
              >
                Annuler
              </button>
              <button
                onClick={confirmReschedule}
                disabled={!selectedAvailabilityId || rescheduleSaving}
                style={{
                  padding: "9px 16px",
                  borderRadius: 8,
                  border: "none",
                  background: selectedAvailabilityId ? "#2563eb" : "#9ca3af",
                  color: "white",
                  fontWeight: 600,
                  fontSize: 13.5,
                  cursor: selectedAvailabilityId && !rescheduleSaving ? "pointer" : "not-allowed",
                  opacity: rescheduleSaving ? 0.7 : 1,
                }}
              >
                {rescheduleSaving ? "Enregistrement..." : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
