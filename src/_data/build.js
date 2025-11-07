module.exports = () => {
  const now = new Date();
  const buildDate = now.toISOString().split("T")[0];
  return {
    date: buildDate,
    timestamp: now.toISOString(),
  };
};
