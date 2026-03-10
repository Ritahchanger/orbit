import { useState } from "react";
import { Link } from "react-router-dom";
import RootLayout from "../../../../layout/RootLayout";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  AlertCircle,
  Rocket,
  MessageSquare,
  Building2,
  Headphones,
  ChevronRight,
} from "lucide-react";

// ── Data ──────────────────────────────────────────────────────────────────────

const CONTACT_CHANNELS = [
  {
    icon: MessageSquare,
    label: "Sales Enquiries",
    value: "sales@orbitpos.io",
    sub: "We reply within 2 hours",
    href: "mailto:sales@orbitpos.io",
    accent: "#2563eb",
    bg: "#eff6ff",
  },
  {
    icon: Headphones,
    label: "Technical Support",
    value: "support@orbitpos.io",
    sub: "24/7 for Pro & Enterprise",
    href: "mailto:support@orbitpos.io",
    accent: "#7c3aed",
    bg: "#f5f3ff",
  },
  {
    icon: Phone,
    label: "Call Us",
    value: "+254 700 123 456",
    sub: "Mon – Fri, 8 am – 6 pm EAT",
    href: "tel:+254700123456",
    accent: "#059669",
    bg: "#ecfdf5",
  },
  {
    icon: MapPin,
    label: "Head Office",
    value: "Westlands, Nairobi",
    sub: "Delta Corner, 4th Floor",
    href: "https://maps.google.com",
    accent: "#d97706",
    bg: "#fffbeb",
  },
];

const INQUIRY_TYPES = [
  "General Enquiry",
  "Sales / Pricing",
  "Technical Support",
  "Partnership",
  "Demo Request",
  "Other",
];

const TEAM_SIZES = [
  "Just me",
  "2 – 10 employees",
  "11 – 50 employees",
  "51 – 200 employees",
  "200+ employees",
];

// ── Inline error helper ───────────────────────────────────────────────────────
const Err = ({ msg }) => (
  <p
    style={{
      marginTop: 4,
      fontSize: 11,
      color: "#ef4444",
      display: "flex",
      alignItems: "center",
      gap: 4,
    }}
  >
    <AlertCircle size={11} /> {msg}
  </p>
);

// ── Contact Page ──────────────────────────────────────────────────────────────
const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    teamSize: "",
    inquiryType: "General Enquiry",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | loading | success

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      e.email = "Invalid email address";
    if (!form.message.trim()) e.message = "Please write a message";
    else if (form.message.trim().length < 20)
      e.message = "At least 20 characters please";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ve = validate();
    if (Object.keys(ve).length > 0) {
      setErrors(ve);
      return;
    }
    setStatus("loading");
    // Replace with your real API call
    await new Promise((r) => setTimeout(r, 1600));
    setStatus("success");
  };

  const inputBase =
    "w-full px-4 py-3 rounded-xl border bg-white text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-all";
  const inputCls = (field) =>
    `${inputBase} ${errors[field] ? "border-red-400 focus:ring-red-200" : "border-gray-200 focus:ring-blue-200 focus:border-blue-400"}`;

  return (
    <RootLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Figtree:wght@400;500;600;700&display=swap');
        .ct { font-family: 'Figtree', sans-serif; }
        .ct-serif { font-family: 'Instrument Serif', serif; }

        @keyframes ctUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ct .f1 { animation: ctUp 0.45s ease both 0.05s; }
        .ct .f2 { animation: ctUp 0.45s ease both 0.12s; }
        .ct .f3 { animation: ctUp 0.45s ease both 0.2s; }
        .ct .f4 { animation: ctUp 0.45s ease both 0.28s; }

        .ct-card {
          display: flex; align-items: flex-start; gap: 14px;
          padding: 18px 20px; border-radius: 14px;
          border: 1px solid #e5e7eb; background: white;
          text-decoration: none;
          transition: box-shadow 0.2s, transform 0.2s, border-color 0.2s;
        }
        .ct-card:hover {
          box-shadow: 0 6px 24px rgba(0,0,0,0.07);
          transform: translateY(-2px); border-color: #d1d5db;
        }
        .ct-pill {
          padding: 6px 14px; border-radius: 99px;
          font-size: 12px; font-weight: 600;
          cursor: pointer; transition: all 0.15s;
          font-family: 'Figtree', sans-serif;
        }
        .ct-submit {
          width: 100%; padding: 14px; border-radius: 12px; border: none;
          background: linear-gradient(135deg, #1d4ed8, #4f46e5);
          color: white; font-family: 'Figtree', sans-serif;
          font-size: 15px; font-weight: 600; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 4px 14px rgba(37,99,235,0.3);
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
        }
        .ct-submit:hover:not(:disabled) {
          opacity: 0.9; transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(37,99,235,0.38);
        }
        .ct-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .ct-spinner {
          width: 17px; height: 17px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: white;
          animation: ctSpin 0.7s linear infinite;
        }
        @keyframes ctSpin { to { transform: rotate(360deg); } }
        .ct-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 14px center;
        }
        .ct-dots {
          background-image: radial-gradient(circle, #e2e8f0 1px, transparent 1px);
          background-size: 24px 24px;
        }
      `}</style>

      <div className="ct">
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section
          className="ct-dots"
          style={{
            background: "#f8fafc",
            paddingTop: 80,
            paddingBottom: 56,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -100,
              right: -100,
              width: 500,
              height: 500,
              background:
                "radial-gradient(circle, rgba(37,99,235,0.07) 0%, transparent 65%)",
              pointerEvents: "none",
            }}
          />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-[2rem]">
            <div className="f2" style={{ maxWidth: 560 }}>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#2563eb",
                  marginBottom: 14,
                }}
              >
                Get in touch
              </p>
              <h1
                className="ct-serif"
                style={{
                  fontSize: "clamp(34px, 5vw, 54px)",
                  color: "#0f172a",
                  lineHeight: 1.15,
                  marginBottom: 18,
                }}
              >
                Let's talk about your <em>business</em>
              </h1>
              <p
                style={{
                  fontSize: 17,
                  color: "#64748b",
                  lineHeight: 1.75,
                  maxWidth: 500,
                }}
              >
                Whether you're exploring Orbit for the first time or need help
                with your existing setup — our team is here.
              </p>
            </div>
          </div>
        </section>

        {/* ── Channel Cards ─────────────────────────────────────────────────── */}
        <section style={{ background: "#f8fafc", paddingBottom: 56 }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="f3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {CONTACT_CHANNELS.map(
                ({ icon: Icon, label, value, sub, href, accent, bg }) => (
                  <a
                    key={label}
                    href={href}
                    className="ct-card"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={18} color={accent} />
                    </div>
                    <div>
                      <p
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: "#94a3b8",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          marginBottom: 3,
                        }}
                      >
                        {label}
                      </p>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#1e293b",
                          marginBottom: 2,
                        }}
                      >
                        {value}
                      </p>
                      <p style={{ fontSize: 12, color: "#94a3b8" }}>{sub}</p>
                    </div>
                  </a>
                ),
              )}
            </div>
          </div>
        </section>

        {/* ── Form + Sidebar ────────────────────────────────────────────────── */}
        <section
          style={{ background: "white", paddingTop: 64, paddingBottom: 96 }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className="f4"
              style={{
                display: "grid",
                gridTemplateColumns: "3fr 2fr",
                gap: 48,
                alignItems: "start",
              }}
            >
              {/* ── Form ── */}
              <div
                style={{
                  background: "#f8fafc",
                  borderRadius: 20,
                  border: "1px solid #e2e8f0",
                  padding: "40px 36px",
                }}
              >
                <h2
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: "#0f172a",
                    marginBottom: 4,
                  }}
                >
                  Send us a message
                </h2>
                <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 32 }}>
                  We usually respond within one business day.
                </p>

                {status === "success" ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "60px 20px",
                      gap: 16,
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: "50%",
                        background: "#ecfdf5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <CheckCircle size={30} color="#16a34a" />
                    </div>
                    <h3
                      className="ct-serif"
                      style={{ fontSize: 26, color: "#0f172a" }}
                    >
                      Message sent!
                    </h3>
                    <p
                      style={{ fontSize: 14, color: "#64748b", maxWidth: 300 }}
                    >
                      Thanks for reaching out. Someone from our team will be in
                      touch shortly.
                    </p>
                    <button
                      onClick={() => {
                        setStatus("idle");
                        setForm({
                          name: "",
                          email: "",
                          company: "",
                          teamSize: "",
                          inquiryType: "General Enquiry",
                          message: "",
                        });
                      }}
                      style={{
                        marginTop: 8,
                        padding: "10px 24px",
                        borderRadius: 10,
                        border: "1px solid #e2e8f0",
                        background: "white",
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#475569",
                        cursor: "pointer",
                      }}
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 20,
                    }}
                  >
                    {/* Name + Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#475569",
                            display: "block",
                            marginBottom: 6,
                          }}
                        >
                          Full Name <span style={{ color: "#ef4444" }}>*</span>
                        </label>
                        <input
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          placeholder="Jane Mwangi"
                          className={inputCls("name")}
                        />
                        {errors.name && <Err msg={errors.name} />}
                      </div>
                      <div>
                        <label
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#475569",
                            display: "block",
                            marginBottom: 6,
                          }}
                        >
                          Email Address{" "}
                          <span style={{ color: "#ef4444" }}>*</span>
                        </label>
                        <input
                          name="email"
                          value={form.email}
                          type="email"
                          onChange={handleChange}
                          placeholder="jane@company.com"
                          className={inputCls("email")}
                        />
                        {errors.email && <Err msg={errors.email} />}
                      </div>
                    </div>

                    {/* Company + Team size */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#475569",
                            display: "block",
                            marginBottom: 6,
                          }}
                        >
                          Company / Business
                        </label>
                        <div style={{ position: "relative" }}>
                          <Building2
                            size={14}
                            color="#94a3b8"
                            style={{
                              position: "absolute",
                              left: 14,
                              top: "50%",
                              transform: "translateY(-50%)",
                            }}
                          />
                          <input
                            name="company"
                            value={form.company}
                            onChange={handleChange}
                            placeholder="Acme Retail Ltd"
                            className={inputCls("company")}
                            style={{ paddingLeft: 38 }}
                          />
                        </div>
                      </div>
                      <div>
                        <label
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#475569",
                            display: "block",
                            marginBottom: 6,
                          }}
                        >
                          Team Size
                        </label>
                        <select
                          name="teamSize"
                          value={form.teamSize}
                          onChange={handleChange}
                          className={`${inputCls("teamSize")} ct-select`}
                          style={{ paddingRight: 36 }}
                        >
                          <option value="">Select team size</option>
                          {TEAM_SIZES.map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Inquiry type pills */}
                    <div>
                      <label
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#475569",
                          display: "block",
                          marginBottom: 10,
                        }}
                      >
                        What can we help with?
                      </label>
                      <div
                        style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
                      >
                        {INQUIRY_TYPES.map((type) => (
                          <button
                            key={type}
                            type="button"
                            className="ct-pill"
                            onClick={() =>
                              setForm((p) => ({ ...p, inquiryType: type }))
                            }
                            style={{
                              border:
                                form.inquiryType === type
                                  ? "1.5px solid #2563eb"
                                  : "1.5px solid #e2e8f0",
                              background:
                                form.inquiryType === type ? "#eff6ff" : "white",
                              color:
                                form.inquiryType === type
                                  ? "#2563eb"
                                  : "#64748b",
                            }}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#475569",
                          display: "block",
                          marginBottom: 6,
                        }}
                      >
                        Message <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <textarea
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        rows={5}
                        placeholder="Tell us about your business and what you'd like to achieve with Orbit..."
                        className={inputCls("message")}
                        style={{ resize: "vertical", minHeight: 120 }}
                      />
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginTop: 4,
                        }}
                      >
                        {errors.message ? (
                          <Err msg={errors.message} />
                        ) : (
                          <span />
                        )}
                        <span style={{ fontSize: 11, color: "#cbd5e1" }}>
                          {form.message.length} chars
                        </span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="ct-submit"
                      disabled={status === "loading"}
                    >
                      {status === "loading" ? (
                        <>
                          <div className="ct-spinner" /> Sending...
                        </>
                      ) : (
                        <>
                          <Send size={15} /> Send Message
                        </>
                      )}
                    </button>

                    <p
                      style={{
                        fontSize: 11,
                        color: "#94a3b8",
                        textAlign: "center",
                      }}
                    >
                      By submitting you agree to our{" "}
                      <Link to="/privacy" style={{ color: "#2563eb" }}>
                        Privacy Policy
                      </Link>
                      . No spam, ever.
                    </p>
                  </form>
                )}
              </div>

              {/* ── Sidebar ── */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: 20 }}
              >
                {/* Hours */}
                <div
                  style={{
                    background: "#0f172a",
                    borderRadius: 20,
                    padding: "28px 24px",
                    color: "white",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 20,
                    }}
                  >
                    <Clock size={17} color="#60a5fa" />
                    <h3 style={{ fontSize: 14, fontWeight: 700 }}>
                      Office Hours
                    </h3>
                  </div>
                  {[
                    { day: "Monday – Friday", hours: "8:00 am – 6:00 pm" },
                    { day: "Saturday", hours: "9:00 am – 1:00 pm" },
                    { day: "Sunday", hours: "Closed" },
                  ].map(({ day, hours }) => (
                    <div
                      key={day}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "10px 0",
                        borderBottom: "1px solid rgba(255,255,255,0.07)",
                        fontSize: 13,
                      }}
                    >
                      <span style={{ color: "#94a3b8" }}>{day}</span>
                      <span
                        style={{
                          fontWeight: 600,
                          color: hours === "Closed" ? "#f87171" : "#86efac",
                        }}
                      >
                        {hours}
                      </span>
                    </div>
                  ))}
                  <p style={{ fontSize: 11, color: "#475569", marginTop: 14 }}>
                    All times in East Africa Time (UTC+3)
                  </p>
                </div>

                {/* Response times */}
                <div
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: 20,
                    padding: "24px 22px",
                    background: "white",
                  }}
                >
                  <h3
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#1e293b",
                      marginBottom: 16,
                    }}
                  >
                    Expected Response Times
                  </h3>
                  {[
                    {
                      label: "Sales",
                      time: "Under 2 hours",
                      color: "#16a34a",
                      bg: "#dcfce7",
                    },
                    {
                      label: "Support (Pro)",
                      time: "Under 4 hours",
                      color: "#2563eb",
                      bg: "#dbeafe",
                    },
                    {
                      label: "Support (Starter)",
                      time: "1 business day",
                      color: "#d97706",
                      bg: "#fef3c7",
                    },
                    {
                      label: "General",
                      time: "1–2 business days",
                      color: "#7c3aed",
                      bg: "#ede9fe",
                    },
                  ].map(({ label, time, color, bg }) => (
                    <div
                      key={label}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 12,
                      }}
                    >
                      <span style={{ fontSize: 13, color: "#475569" }}>
                        {label}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "3px 10px",
                          borderRadius: 99,
                          background: bg,
                          color,
                        }}
                      >
                        {time}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Demo CTA */}
                <div
                  style={{
                    borderRadius: 20,
                    padding: "28px 24px",
                    background: "linear-gradient(135deg, #2563eb, #4f46e5)",
                    color: "white",
                  }}
                >
                  <Rocket
                    size={20}
                    color="rgba(255,255,255,0.75)"
                    style={{ marginBottom: 12 }}
                  />
                  <h3
                    className="ct-serif"
                    style={{ fontSize: 22, marginBottom: 8 }}
                  >
                    See Orbit in action
                  </h3>
                  <p
                    style={{
                      fontSize: 13,
                      color: "rgba(255,255,255,0.72)",
                      marginBottom: 20,
                      lineHeight: 1.65,
                    }}
                  >
                    Book a free 30-minute demo and we'll walk you through the
                    platform tailored to your business.
                  </p>
                  <Link
                    to="/signup"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "10px 20px",
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 700,
                      background: "white",
                      color: "#2563eb",
                      textDecoration: "none",
                    }}
                  >
                    Book a Demo <ChevronRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Map ──────────────────────────────────────────────────────────── */}
        <section style={{ background: "#f1f5f9", padding: "16px 0 0" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-0">
            <div
              style={{
                borderRadius: "16px 16px 0 0",
                overflow: "hidden",
                height: 220,
                border: "1px solid #e2e8f0",
                borderBottom: "none",
                position: "relative",
              }}
            >
              <iframe
                title="Orbit Office"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.818860895295!2d36.80268!3d-1.268!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zV2VzdGxhbmRzLCBOYWlyb2Jp!5e0!3m2!1sen!2ske!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0, display: "block" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 14,
                  left: 14,
                  background: "white",
                  borderRadius: 10,
                  padding: "7px 14px",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                }}
              >
                <MapPin size={13} color="#2563eb" />
                <span
                  style={{ fontSize: 12, fontWeight: 600, color: "#1e293b" }}
                >
                  Delta Corner, Westlands — Nairobi, Kenya
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </RootLayout>
  );
};

export default Contact;
