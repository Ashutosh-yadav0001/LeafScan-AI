import React, { useState, useEffect, useCallback } from "react";
// This component handles the main page logic: uploading image, calling API, and showing results.
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Button,
  CircularProgress,
  Box,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import {
  Clear,
  CloudUpload,
  History,
  ExpandMore,
  ExpandLess,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { useDropzone } from "react-dropzone";
import axios from "axios";

// History helper functions
const getHistory = () => {
  try {
    const history = localStorage.getItem("predictionHistory");
    return history ? JSON.parse(history) : [];
  } catch {
    return [];
  }
};

const saveToHistory = (prediction) => {
  const history = getHistory();
  const newEntry = {
    ...prediction,
    timestamp: new Date().toISOString(),
    id: Date.now(),
  };
  const updatedHistory = [newEntry, ...history].slice(0, 5);
  localStorage.setItem("predictionHistory", JSON.stringify(updatedHistory));
  return updatedHistory;
};

// Styles
const styles = {
  root: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
  },
  appbar: {
    background: "rgba(15, 23, 42, 0.8)",
    backdropFilter: "blur(20px)",
    boxShadow: "0 4px 30px rgba(0, 0, 0, 0.3)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  },
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    padding: { xs: "0.5rem 1rem", md: "0.5rem 2rem" },
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  logoIcon: {
    fontSize: { xs: "2rem", md: "2.5rem" },
  },
  logoText: {
    fontWeight: 800,
    fontSize: { xs: "1.2rem", md: "1.5rem" },
    background: "linear-gradient(90deg, #10b981, #34d399)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  tagline: {
    color: "rgba(255,255,255,0.6)",
    fontSize: "0.75rem",
    display: { xs: "none", sm: "block" },
  },
  mainContainer: {
    minHeight: "calc(100vh - 80px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: { xs: "1rem", md: "2rem" },
  },
  heroTitle: {
    fontSize: { xs: "1.75rem", md: "2.5rem" },
    fontWeight: 800,
    color: "#fff",
    textAlign: "center",
    mb: 1,
    "& span": {
      background: "linear-gradient(90deg, #10b981, #34d399)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
  },
  heroSubtitle: {
    fontSize: { xs: "0.9rem", md: "1.1rem" },
    color: "rgba(255,255,255,0.6)",
    maxWidth: "500px",
    margin: "0 auto",
    textAlign: "center",
    lineHeight: 1.6,
    px: 2,
  },
  uploadCard: {
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(20px)",
    borderRadius: "24px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
    maxWidth: "500px",
    width: "100%",
    margin: "0 auto",
    overflow: "hidden",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    "&:hover": {
      transform: "translateY(-5px)",
      boxShadow: "0 35px 60px -15px rgba(0, 0, 0, 0.6)",
    },
  },
  dropzone: {
    background: "rgba(255, 255, 255, 0.03)",
    border: "2px dashed rgba(16, 185, 129, 0.5)",
    borderRadius: "16px",
    minHeight: { xs: "180px", md: "250px" },
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.3s ease",
    p: 3,
    "&:hover": {
      borderColor: "#10b981",
      background: "rgba(16, 185, 129, 0.1)",
    },
  },
  previewImage: {
    height: { xs: 250, md: 350 },
    borderRadius: "16px",
    objectFit: "cover",
    width: "100%",
  },
  resultCard: {
    mt: 2,
    p: 2,
    borderRadius: "16px",
    textAlign: "center",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1rem",
    py: 3,
  },
  historyPanel: {
    background: "rgba(255, 255, 255, 0.03)",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    mt: 2,
    overflow: "hidden",
  },
  historyHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    p: 2,
    cursor: "pointer",
    "&:hover": {
      background: "rgba(255, 255, 255, 0.05)",
    },
  },
  clearButton: {
    mt: 2,
    width: "100%",
    py: 1.5,
    borderRadius: "12px",
    background: "linear-gradient(135deg, #ef4444, #dc2626)",
    color: "#fff",
    fontWeight: 600,
    textTransform: "none",
    "&:hover": {
      background: "linear-gradient(135deg, #dc2626, #b91c1c)",
    },
  },
  featureItem: {
    textAlign: "center",
    p: 1,
  },
};

export const ImageUpload = () => {
  const [, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [plantType, setPlantType] = useState("potato");

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  // Function to send the image to the backend API
  const sendFile = useCallback(async (file) => {
    setIsLoading(true);
    setError(null);
    setData(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        `/predict?plant_type=${plantType}`,
        formData
      );
      if (res.status === 200) {
        setData(res.data);
        const updatedHistory = saveToHistory(res.data);
        setHistory(updatedHistory);
      }
    } catch (err) {
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Failed to analyze image. Please try again.");
      }
    }
    setIsLoading(false);
  }, [plantType]);

  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setSelectedFile(file);
        setPreview(URL.createObjectURL(file));
        sendFile(file);
      }
    },
    [sendFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  const clearData = () => {
    setData(null);
    setSelectedFile(null);
    setPreview(null);
    setError(null);
  };

  const confidence = data ? (parseFloat(data.confidence) * 100).toFixed(1) : 0;

  const getResultStyle = () => {
    if (!data) return {};
    if (data.class === "Healthy")
      return { background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.4)" };
    if (data.class === "Early Blight")
      return { background: "rgba(245, 158, 11, 0.15)", border: "1px solid rgba(245, 158, 11, 0.4)" };
    if (data.class === "Late Blight")
      return { background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.4)" };
    return {};
  };

  const getResultColor = () => {
    if (!data) return "#10b981";
    if (data.class === "Healthy") return "#10b981";
    if (data.class === "Early Blight") return "#f59e0b";
    if (data.class === "Late Blight") return "#ef4444";
    return "#10b981";
  };

  const getResultIcon = () => {
    if (!data) return "🥔";
    if (data.class === "Healthy") return "✅";
    if (data.class === "Early Blight") return "⚠️";
    if (data.class === "Late Blight") return "🚨";
    return "🥔";
  };

  const getHistoryIcon = (className) => {
    if (className === "Healthy") return <CheckCircle sx={{ color: "#10b981" }} />;
    if (className === "Early Blight") return <Warning sx={{ color: "#f59e0b" }} />;
    if (className === "Late Blight") return <ErrorIcon sx={{ color: "#ef4444" }} />;
    return null;
  };

  return (
    <Box sx={styles.root}>
      <AppBar position="static" sx={styles.appbar}>
        <Toolbar sx={styles.toolbar}>
          <Box sx={styles.logo}>
            <Typography sx={styles.logoIcon}>🌿</Typography>
            <Box>
              <Typography sx={styles.logoText}>LeafScan AI</Typography>
              <Typography sx={styles.tagline}>Smart Leaf Analysis</Typography>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={styles.mainContainer}>
        <Grid container direction="column" alignItems="center" spacing={3}>
          <Grid item>
            <Typography sx={styles.heroTitle}>
              Protect Your <span>{plantType === "potato" ? "Potato" : "Tomato"} Crops</span>
            </Typography>
            <Typography sx={styles.heroSubtitle}>
              Upload a photo of your {plantType} plant leaf and our AI will instantly
              detect diseases or confirm it's healthy.
            </Typography>

            {/* Plant Type Selector */}
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <ToggleButtonGroup
                value={plantType}
                exclusive
                onChange={(e, newValue) => { if (newValue) { setPlantType(newValue); clearData(); } }}
                sx={{
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  "& .MuiToggleButton-root": {
                    color: "rgba(255,255,255,0.7)",
                    border: "none",
                    px: 3,
                    py: 1,
                    textTransform: "none",
                    fontWeight: 600,
                    "&.Mui-selected": {
                      background: "linear-gradient(135deg, #10b981, #34d399)",
                      color: "#fff",
                    },
                  },
                }}
              >
                <ToggleButton value="potato">🥔 Potato</ToggleButton>
                <ToggleButton value="tomato">🍅 Tomato</ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Grid>

          <Grid item sx={{ width: "100%", maxWidth: 500 }}>
            <Card sx={styles.uploadCard}>
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                {!preview && (
                  <Box {...getRootProps()} sx={styles.dropzone}>
                    <input {...getInputProps()} />
                    <CloudUpload sx={{ fontSize: 60, color: "#10b981", mb: 2 }} />
                    <Typography sx={{ color: "rgba(255,255,255,0.7)", textAlign: "center" }}>
                      {isDragActive
                        ? "Drop the image here..."
                        : `Drag & drop a ${plantType} leaf image here, or click to select`}
                    </Typography>
                  </Box>
                )}

                {preview && (
                  <CardMedia
                    component="img"
                    sx={styles.previewImage}
                    image={preview}
                    alt="Uploaded leaf"
                  />
                )}

                {isLoading && (
                  <Box sx={styles.loadingContainer}>
                    <CircularProgress
                      size={60}
                      sx={{
                        color: "#10b981",
                        animation: "pulse 1.5s ease-in-out infinite",
                        "@keyframes pulse": {
                          "0%, 100%": { opacity: 1 },
                          "50%": { opacity: 0.5 },
                        },
                      }}
                    />
                    <Typography sx={{ color: "rgba(255,255,255,0.8)" }}>
                      Analyzing your image...
                    </Typography>
                  </Box>
                )}

                {data && (
                  <Box sx={{ ...styles.resultCard, ...getResultStyle() }}>
                    <Typography sx={{ fontSize: "3rem", mb: 1 }}>{getResultIcon()}</Typography>
                    <Typography
                      sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.875rem", mb: 0.5 }}
                    >
                      DISEASE DETECTION RESULT
                    </Typography>
                    <Typography sx={{ color: getResultColor(), fontSize: "1.75rem", fontWeight: 700 }}>
                      {data.class}
                    </Typography>
                    <Box
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        background: "rgba(255,255,255,0.1)",
                        mt: 2,
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          height: "100%",
                          width: `${confidence}%`,
                          background: getResultColor(),
                          borderRadius: 4,
                          transition: "width 0.5s ease",
                        }}
                      />
                    </Box>
                    <Typography sx={{ color: "#fff", mt: 1, textAlign: "right" }}>
                      Confidence: {confidence}%
                    </Typography>
                  </Box>
                )}

                {error && (
                  <Box
                    sx={{
                      ...styles.resultCard,
                      background: "rgba(239, 68, 68, 0.15)",
                      border: "1px solid rgba(239, 68, 68, 0.4)",
                    }}
                  >
                    <Typography sx={{ fontSize: "3rem", mb: 1 }}>🍃</Typography>
                    <Typography sx={{ color: "#ef4444", fontSize: "1.25rem", fontWeight: 600 }}>
                      Not a {plantType === "potato" ? "Potato" : "Tomato"} Leaf
                    </Typography>
                    <Typography sx={{ color: "rgba(255,255,255,0.7)", mt: 1 }}>{error}</Typography>
                  </Box>
                )}

                {(data || error) && (
                  <Button
                    variant="contained"
                    sx={styles.clearButton}
                    onClick={clearData}
                    startIcon={<Clear />}
                  >
                    Try Another Image
                  </Button>
                )}

                {/* History Panel */}
                {history.length > 0 && (
                  <Paper sx={styles.historyPanel}>
                    <Box sx={styles.historyHeader} onClick={() => setShowHistory(!showHistory)}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <History sx={{ color: "#10b981" }} />
                        <Typography sx={{ color: "#fff" }}>Recent Predictions</Typography>
                        <Chip label={history.length} size="small" sx={{ bgcolor: "#10b981", color: "#fff" }} />
                      </Box>
                      <IconButton size="small">
                        {showHistory ? (
                          <ExpandLess sx={{ color: "#fff" }} />
                        ) : (
                          <ExpandMore sx={{ color: "#fff" }} />
                        )}
                      </IconButton>
                    </Box>
                    <Collapse in={showHistory}>
                      <List dense sx={{ py: 0 }}>
                        {history.map((item, index) => (
                          <ListItem key={item.id || index} sx={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                            <ListItemIcon sx={{ minWidth: 40 }}>{getHistoryIcon(item.class)}</ListItemIcon>
                            <ListItemText
                              primary={item.class}
                              secondary={`${(item.confidence * 100).toFixed(1)}% confidence`}
                              primaryTypographyProps={{ sx: { color: "#fff" } }}
                              secondaryTypographyProps={{ sx: { color: "rgba(255,255,255,0.5)" } }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Collapse>
                  </Paper>
                )}
              </CardContent>
            </Card>
          </Grid>

          {!preview && (
            <Grid item>
              <Box sx={{ display: "flex", justifyContent: "center", gap: { xs: 2, md: 4 }, flexWrap: "wrap" }}>
                <Box sx={styles.featureItem}>
                  <Typography sx={{ fontSize: "2rem" }}>⚡</Typography>
                  <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.875rem" }}>
                    Instant Results
                  </Typography>
                </Box>
                <Box sx={styles.featureItem}>
                  <Typography sx={{ fontSize: "2rem" }}>🎯</Typography>
                  <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.875rem" }}>
                    99% Accuracy
                  </Typography>
                </Box>
                <Box sx={styles.featureItem}>
                  <Typography sx={{ fontSize: "2rem" }}>🔒</Typography>
                  <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.875rem" }}>
                    Secure & Private
                  </Typography>
                </Box>
              </Box>
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  );
};
