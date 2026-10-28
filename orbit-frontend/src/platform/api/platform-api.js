import platformClient from "./platform-client";

const data = (response) => response.data;

const platformApi = {
  login: (credentials) => platformClient.post("/auth/login", credentials).then(data),
  logout: () => platformClient.post("/auth/logout").then(data),
  me: () => platformClient.get("/auth/me").then(data),

  overview: () => platformClient.get("/overview").then(data),
  // params: { action, businessId, page, limit }
  activity: (params) => platformClient.get("/activity", { params }).then(data),
  search: (q) => platformClient.get("/search", { params: { q } }).then(data),

  // params: { search, status, plan, verified, sort, page, limit }
  businesses: (params) => platformClient.get("/businesses", { params }).then(data),
  business: (id) => platformClient.get(`/businesses/${id}`).then(data),
  // Billing
  subscriptions: (params) => platformClient.get("/billing/subscriptions", { params }).then(data),
  payments: (params) => platformClient.get("/billing/payments", { params }).then(data),
  plans: () => platformClient.get("/billing/plans").then(data),
  extendTrial: (id, body) => platformClient.post(`/businesses/${id}/subscription/trial-extension`, body).then(data),
  changePlan: (id, body) => platformClient.post(`/businesses/${id}/subscription/plan-change`, body).then(data),
  recordPayment: (id, body) => platformClient.post(`/businesses/${id}/payments`, body).then(data),

  changeBusinessStatus: (id, status, reason) =>
    platformClient.patch(`/businesses/${id}/status`, { status, reason }).then(data),
};

export default platformApi;
