}),
);
app.use(cors());
app.use(express.json());
// Photos arrive as base64 text inside JSON, so allow bigger orders than the
// default 100 KB. Without this, uploads fail with "413 Payload Too Large".
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);