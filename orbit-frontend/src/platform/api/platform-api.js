import platformClient from "./platform-client";

const data = (response) => response.data;

const platformApi = {
  login: (credentials) => platformClient.post("/auth/login", credentials).then(data),
  logout: () => platformClient.post("/auth/logout").then(data),
  me: () => platformClient.get("/auth/me").then(data),

  overview: () => platformClient.get("/overview").then(data),
  search: (q) => platformClient.get("/search", { params: { q } }).then(data),

  // params: { search, status, plan, verified, sort, page, limit }
  businesses: (params) => platformClient.get("/businesses", { params }).then(data),
  business: (id) => platformClient.get(`/businesses/${id}`).then(data),
  changeBusinessStatus: (id, status, reason) =>
    platformClient.patch(`/businesses/${id}/status`, { status, reason }).then(data),
};

export default platformApi;
