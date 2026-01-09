import { useState } from "react";
import { Box, Paper, Typography, LinearProgress, Grid, Chip } from "@mui/material";
import {
  CheckCircleOutlined,
  EmojiEventsOutlined,
  AttachMoneyOutlined,
  MessageOutlined,
  StarOutlined,
} from "@mui/icons-material";

interface Level {
  name: string;
  color: string;
  minPoints: number;
}

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  progress: number;
  benefit: string;
}

interface PerformanceMetric {
  metric: string;
  value: number;
  target: number;
  avgResponseTime?: string;
  projects?: number;
  reviews?: number;
  formatted?: string;
  impact: "Critical" | "High" | "Medium";
  color: "blue" | "green" | "amber" | "purple";
  description: string;
}

export default function LevelContent() {
  const [currentLevel] = useState("Silver");
  const [progress] = useState(65);

  const levels: Level[] = [
    { name: "Bronze", color: "linear-gradient(135deg, #B87333 0%, #CD7F32 100%)", minPoints: 0 },
    { name: "Silver", color: "linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)", minPoints: 100 },
    { name: "Gold", color: "linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)", minPoints: 500 },
    { name: "Platinum", color: "linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)", minPoints: 1500 },
    { name: "Diamond", color: "linear-gradient(135deg, #A78BFA 0%, #EC4899 100%)", minPoints: 3000 },
  ];

  const stats = {
    responseRate: 92,
    avgResponseTime: "1 hour",
    successRate: 98,
    completedProjects: 47,
    avgRating: 4.9,
    totalReviews: 42,
    totalEarnings: 12450,
    currentPoints: 650,
    nextLevelPoints: 1500,
  };

  const achievements: Achievement[] = [
    {
      id: 1,
      name: "Quick Responder",
      description: "Reply to messages within 1 hour",
      icon: "⚡",
      earned: true,
      progress: 100,
      benefit: "+2% visibility boost",
    },
    {
      id: 2,
      name: "Perfect Delivery",
      description: "Complete 10 projects on time",
      icon: "✅",
      earned: true,
      progress: 100,
      benefit: "+5% trust score",
    },
    {
      id: 3,
      name: "Rising Star",
      description: "Maintain 4.8+ rating for 30 days",
      icon: "⭐",
      earned: true,
      progress: 100,
      benefit: "Featured in search",
    },
    {
      id: 4,
      name: "Top Earner",
      description: "Earn $10,000+ in total",
      icon: "💰",
      earned: true,
      progress: 100,
      benefit: "Priority support",
    },
    {
      id: 5,
      name: "Client Favorite",
      description: "Receive 50 five-star reviews",
      icon: "❤️",
      earned: false,
      progress: 84,
      benefit: "Premium badge",
    },
    {
      id: 6,
      name: "Speed Demon",
      description: "Complete 100 projects",
      icon: "🚀",
      earned: false,
      progress: 47,
      benefit: "+10% earnings boost",
    },
  ];

  const performanceMetrics: PerformanceMetric[] = [
    {
      metric: "Response Rate",
      value: stats.responseRate,
      target: 95,
      avgResponseTime: stats.avgResponseTime,
      impact: "High",
      color: "blue",
      description: "Reply to client messages quickly to improve visibility",
    },
    {
      metric: "Success Rate",
      value: stats.successRate,
      target: 100,
      projects: stats.completedProjects,
      impact: "Critical",
      color: "green",
      description: "Complete projects successfully to build trust",
    },
    {
      metric: "Average Rating",
      value: stats.avgRating,
      target: 5.0,
      reviews: stats.totalReviews,
      impact: "Critical",
      color: "amber",
      description: "Maintain high ratings to attract premium clients",
    },
    {
      metric: "Total Earnings",
      value: stats.totalEarnings,
      target: 50000,
      formatted: `$${stats.totalEarnings.toLocaleString()}`,
      impact: "Medium",
      color: "purple",
      description: "Higher earnings unlock exclusive perks",
    },
  ];

  const levelBenefits = [
    {
      level: "Bronze",
      benefits: ["Basic profile visibility", "Standard support", "Up to 5 active services"],
    },
    {
      level: "Silver",
      benefits: [
        "Enhanced profile visibility",
        "Priority support",
        "Up to 10 active services",
        "Custom service packages",
        "+5% algorithm boost",
      ],
    },
    {
      level: "Gold",
      benefits: [
        "Premium profile placement",
        "VIP support 24/7",
        "Unlimited services",
        "Featured in category",
        "+15% algorithm boost",
        "Reduced fees (2% off)",
      ],
    },
    {
      level: "Platinum",
      benefits: [
        "Top search placement",
        "Dedicated account manager",
        "Exclusive client matching",
        "+25% algorithm boost",
        "Reduced fees (5% off)",
        "Early access to features",
      ],
    },
    {
      level: "Diamond",
      benefits: [
        "Maximum visibility",
        "White-glove service",
        "Personal brand consultation",
        "+40% algorithm boost",
        "Reduced fees (10% off)",
        "VIP events access",
        "Featured on homepage",
      ],
    },
  ];

  const currentLevelIndex = levels.findIndex(l => l.name === currentLevel);
  const currentLevelData = levels.find(l => l.name === currentLevel);

  const getMetricColor = (color: string) => {
    switch (color) {
      case "blue":
        return { bg: "rgba(37, 99, 235, 0.1)", text: "#3b82f6" };
      case "green":
        return { bg: "rgba(34, 197, 94, 0.1)", text: "#16a34a" };
      case "amber":
        return { bg: "rgba(234, 179, 8, 0.1)", text: "#f59e0b" };
      case "purple":
        return { bg: "rgba(168, 85, 247, 0.1)", text: "#a855f7" };
      default:
        return { bg: "rgba(0, 0, 0, 0.1)", text: "black" };
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "Critical":
        return { bg: "rgba(239, 68, 68, 0.1)", text: "#dc2626" };
      case "High":
        return { bg: "rgba(249, 115, 22, 0.1)", text: "#ea580c" };
      case "Medium":
        return { bg: "rgba(37, 99, 235, 0.1)", text: "#3b82f6" };
      default:
        return { bg: "rgba(0, 0, 0, 0.1)", text: "black" };
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Current Level Overview */}
      <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0, 0, 0, 0.08)", p: 4 }}>
        <Box sx={{ display: "flex", alignItems: "start", justifyContent: "space-between", mb: 4 }}>
          <Box>
            <Typography sx={{ fontSize: 28, fontWeight: 600, color: "black", mb: 1 }}>Freelancer Level</Typography>
            <Typography sx={{ fontSize: 13, color: "rgba(0, 0, 0, 0.6)" }}>
              Build your reputation and unlock exclusive benefits
            </Typography>
          </Box>
          <Box
            sx={{
              px: 3,
              py: 1.5,
              background: currentLevelData?.color,
              borderRadius: 3,
            }}>
            <Typography sx={{ fontSize: 11, color: "rgba(255, 255, 255, 0.8)", mb: 0.5 }}>Current Level</Typography>
            <Typography sx={{ fontSize: 24, fontWeight: 600, color: "white" }}>{currentLevel}</Typography>
          </Box>
        </Box>

        {/* Level Progress Bar */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
            <Box>
              <Typography sx={{ fontSize: 13, color: "rgba(0, 0, 0, 0.8)", fontWeight: 500, mb: 0.5 }}>
                {stats.currentPoints} / {stats.nextLevelPoints} points
              </Typography>
              <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)" }}>
                {stats.nextLevelPoints - stats.currentPoints} points to Gold
              </Typography>
            </Box>
            <Typography sx={{ fontSize: 17, fontWeight: 600, color: "black" }}>{progress}%</Typography>
          </Box>
          <LinearProgress
            variant='determinate'
            value={progress}
            sx={{
              height: 12,
              borderRadius: 10,
              bgcolor: "rgba(0, 0, 0, 0.05)",
              "& .MuiLinearProgress-bar": {
                background: "linear-gradient(90deg, #0071e3 0%, #0077ED 100%)",
                borderRadius: 10,
              },
            }}
          />
        </Box>

        {/* Level Progression */}
        <Grid container spacing={1.5}>
          {levels.map((level, idx) => {
            const isPassed = idx < currentLevelIndex;
            const isCurrent = idx === currentLevelIndex;

            return (
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={level.name}>
                <Box
                  sx={{
                    position: "relative",
                    p: 2,
                    borderRadius: 3,
                    border: "2px solid",
                    borderColor: isCurrent ? "black" : isPassed ? "rgba(34, 197, 94, 0.3)" : "rgba(0, 0, 0, 0.1)",
                    bgcolor: isCurrent ? "rgba(0, 0, 0, 0.05)" : isPassed ? "rgba(34, 197, 94, 0.05)" : "white",
                    transition: "all 0.3s",
                  }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: level.color,
                      mb: 1,
                    }}
                  />
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: "black", mb: 0.5 }}>{level.name}</Typography>
                  <Typography sx={{ fontSize: 10, color: "rgba(0, 0, 0, 0.6)" }}>{level.minPoints} pts</Typography>

                  {isPassed && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                      }}>
                      <CheckCircleOutlined sx={{ fontSize: 20, color: "#16a34a" }} />
                    </Box>
                  )}

                  {isCurrent && (
                    <Chip
                      label='Current'
                      sx={{
                        position: "absolute",
                        top: -12,
                        left: "50%",
                        transform: "translateX(-50%)",
                        height: 20,
                        bgcolor: "black",
                        color: "white",
                        fontSize: 9,
                        fontWeight: 500,
                      }}
                    />
                  )}
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      {/* Performance Metrics */}
      <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0, 0, 0, 0.08)", p: 4 }}>
        <Typography sx={{ fontSize: 17, fontWeight: 600, color: "black", mb: 1 }}>Performance Metrics</Typography>
        <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.6)", mb: 3 }}>
          These metrics directly impact your level and visibility on KickAir
        </Typography>

        <Grid container spacing={2}>
          {performanceMetrics.map(metric => {
            const percentage =
              metric.metric === "Total Earnings"
                ? (metric.value / metric.target) * 100
                : metric.metric === "Average Rating"
                ? (metric.value / metric.target) * 100
                : metric.value;

            const colors = getMetricColor(metric.color);
            const impactColors = getImpactColor(metric.impact);

            return (
              <Grid size={{ xs: 12, md: 6 }} key={metric.metric}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    border: "1px solid rgba(0, 0, 0, 0.1)",
                    borderRadius: 3,
                    transition: "border-color 0.3s",
                    "&:hover": {
                      borderColor: "rgba(0, 0, 0, 0.2)",
                    },
                  }}>
                  <Box sx={{ display: "flex", alignItems: "start", justifyContent: "space-between", mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          bgcolor: colors.bg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}>
                        {metric.color === "blue" && <MessageOutlined sx={{ fontSize: 20, color: colors.text }} />}
                        {metric.color === "green" && <EmojiEventsOutlined sx={{ fontSize: 20, color: colors.text }} />}
                        {metric.color === "amber" && <StarOutlined sx={{ fontSize: 20, color: colors.text }} />}
                        {metric.color === "purple" && <AttachMoneyOutlined sx={{ fontSize: 20, color: colors.text }} />}
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: "black" }}>{metric.metric}</Typography>
                        <Typography sx={{ fontSize: 10, color: "rgba(0, 0, 0, 0.6)", mt: 0.25 }}>
                          {metric.metric === "Response Rate" && `Avg: ${metric.avgResponseTime}`}
                          {metric.metric === "Success Rate" && `${metric.projects} completed`}
                          {metric.metric === "Average Rating" && `${metric.reviews} reviews`}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={`${metric.impact} Impact`}
                      sx={{
                        height: 22,
                        fontSize: 9,
                        fontWeight: 500,
                        bgcolor: impactColors.bg,
                        color: impactColors.text,
                      }}
                    />
                  </Box>

                  <Box sx={{ mb: 1.5 }}>
                    <Box sx={{ display: "flex", alignItems: "end", justifyContent: "space-between", mb: 1 }}>
                      <Typography sx={{ fontSize: 24, fontWeight: 600, color: "black" }}>
                        {metric.metric === "Total Earnings"
                          ? metric.formatted
                          : metric.metric === "Average Rating"
                          ? metric.value.toFixed(1)
                          : `${metric.value}%`}
                      </Typography>
                      <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)" }}>
                        Target:{" "}
                        {metric.metric === "Total Earnings"
                          ? `$${metric.target.toLocaleString()}`
                          : metric.metric === "Average Rating"
                          ? metric.target.toFixed(1)
                          : `${metric.target}%`}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant='determinate'
                      value={Math.min(percentage, 100)}
                      sx={{
                        height: 8,
                        borderRadius: 10,
                        bgcolor: "rgba(0, 0, 0, 0.05)",
                        "& .MuiLinearProgress-bar": {
                          bgcolor: colors.text,
                          borderRadius: 10,
                        },
                      }}
                    />
                  </Box>

                  <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)" }}>{metric.description}</Typography>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      {/* Achievements & Badges */}
      <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0, 0, 0, 0.08)", p: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
          <Box>
            <Typography sx={{ fontSize: 17, fontWeight: 600, color: "black", mb: 0.5 }}>Achievements & Badges</Typography>
            <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.6)" }}>
              Earn badges to boost your profile visibility and unlock benefits
            </Typography>
          </Box>
          <Typography sx={{ fontSize: 13, color: "rgba(0, 0, 0, 0.6)" }}>
            {achievements.filter(a => a.earned).length} / {achievements.length} earned
          </Typography>
        </Box>

        <Grid container spacing={2}>
          {achievements.map(achievement => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={achievement.id}>
              <Paper
                elevation={0}
                sx={{
                  position: "relative",
                  p: 2.5,
                  borderRadius: 3,
                  border: "2px solid",
                  borderColor: achievement.earned ? "rgba(34, 197, 94, 0.3)" : "rgba(0, 0, 0, 0.1)",
                  bgcolor: achievement.earned ? "rgba(34, 197, 94, 0.05)" : "white",
                  transition: "border-color 0.3s",
                  "&:hover": {
                    borderColor: achievement.earned ? "rgba(34, 197, 94, 0.3)" : "rgba(0, 0, 0, 0.2)",
                  },
                }}>
                {achievement.earned && (
                  <Box sx={{ position: "absolute", top: 12, right: 12 }}>
                    <CheckCircleOutlined sx={{ fontSize: 24, color: "#16a34a" }} />
                  </Box>
                )}

                <Typography sx={{ fontSize: 32, mb: 1.5 }}>{achievement.icon}</Typography>

                <Typography sx={{ fontSize: 13, fontWeight: 600, color: "black", mb: 0.5 }}>{achievement.name}</Typography>
                <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.6)", mb: 1.5 }}>{achievement.description}</Typography>

                <Box sx={{ mb: 1.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.75 }}>
                    <Typography sx={{ fontSize: 10, color: "rgba(0, 0, 0, 0.6)" }}>Progress</Typography>
                    <Typography sx={{ fontSize: 10, fontWeight: 500, color: "black" }}>{achievement.progress}%</Typography>
                  </Box>
                  <LinearProgress
                    variant='determinate'
                    value={achievement.progress}
                    sx={{
                      height: 6,
                      borderRadius: 10,
                      bgcolor: "rgba(0, 0, 0, 0.05)",
                      "& .MuiLinearProgress-bar": {
                        bgcolor: achievement.earned ? "#16a34a" : "#3b82f6",
                        borderRadius: 10,
                      },
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    pt: 1.5,
                    borderTop: "1px solid rgba(0, 0, 0, 0.08)",
                  }}>
                  <Typography sx={{ fontSize: 10, color: "rgba(0, 0, 0, 0.6)", mb: 0.5 }}>Benefit</Typography>
                  <Typography
                    sx={{
                      fontSize: 11,
                      fontWeight: 500,
                      color: achievement.earned ? "rgb(21, 128, 61)" : "rgba(0, 0, 0, 0.6)",
                    }}>
                    {achievement.benefit}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Level Benefits Comparison */}
      <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid rgba(0, 0, 0, 0.08)", p: 4 }}>
        <Typography sx={{ fontSize: 17, fontWeight: 600, color: "black", mb: 1 }}>Level Benefits</Typography>
        <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.6)", mb: 3 }}>
          See what you unlock as you progress through levels
        </Typography>

        <Grid container spacing={2}>
          {levelBenefits.map(levelBenefit => {
            const thisLevelIndex = levels.findIndex(l => l.name === levelBenefit.level);
            const isPassed = thisLevelIndex < currentLevelIndex;
            const isCurrent = thisLevelIndex === currentLevelIndex;
            const levelData = levels.find(l => l.name === levelBenefit.level);

            return (
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={levelBenefit.level}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    border: "2px solid",
                    borderColor: isCurrent ? "black" : isPassed ? "rgba(34, 197, 94, 0.2)" : "rgba(0, 0, 0, 0.1)",
                    bgcolor: isCurrent ? "rgba(0, 0, 0, 0.05)" : isPassed ? "rgba(34, 197, 94, 0.05)" : "white",
                    height: "100%",
                  }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: levelData?.color,
                      }}
                    />
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: "black" }}>{levelBenefit.level}</Typography>
                  </Box>

                  <Box component='ul' sx={{ m: 0, p: 0, pl: 2, display: "flex", flexDirection: "column", gap: 1 }}>
                    {levelBenefit.benefits.map((benefit, idx) => (
                      <Box
                        component='li'
                        key={idx}
                        sx={{
                          fontSize: 11,
                          color: isPassed || isCurrent ? "rgba(0, 0, 0, 0.7)" : "rgba(0, 0, 0, 0.4)",
                          lineHeight: 1.5,
                        }}>
                        {benefit}
                      </Box>
                    ))}
                  </Box>

                  {isCurrent && (
                    <Box
                      sx={{
                        mt: 2,
                        pt: 2,
                        borderTop: "1px solid rgba(0, 0, 0, 0.1)",
                      }}>
                      <Chip
                        label='Your Current Level'
                        sx={{
                          width: "100%",
                          height: 24,
                          bgcolor: "black",
                          color: "white",
                          fontSize: 9,
                          fontWeight: 500,
                        }}
                      />
                    </Box>
                  )}
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      {/* How to Earn Points */}
      <Paper
        elevation={0}
        sx={{
          background: "linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)",
          border: "1px solid rgba(37, 99, 235, 0.2)",
          borderRadius: 4,
          p: 4,
        }}>
        <Typography sx={{ fontSize: 17, fontWeight: 600, color: "black", mb: 3 }}>How to Earn Points & Level Up</Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper
              elevation={0}
              sx={{ p: 2.5, borderRadius: 3, bgcolor: "rgba(255, 255, 255, 0.6)", backdropFilter: "blur(8px)" }}>
              <Typography sx={{ fontSize: 24, mb: 1 }}>⚡</Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: "black", mb: 1 }}>Quick Responses</Typography>
              <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.7)", mb: 1 }}>
                Reply to messages within 1 hour to earn bonus points
              </Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#3b82f6" }}>+5 points per fast reply</Typography>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper
              elevation={0}
              sx={{ p: 2.5, borderRadius: 3, bgcolor: "rgba(255, 255, 255, 0.6)", backdropFilter: "blur(8px)" }}>
              <Typography sx={{ fontSize: 24, mb: 1 }}>✅</Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: "black", mb: 1 }}>Complete Projects</Typography>
              <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.7)", mb: 1 }}>
                Successfully complete projects on time
              </Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#3b82f6" }}>+10-50 points per project</Typography>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper
              elevation={0}
              sx={{ p: 2.5, borderRadius: 3, bgcolor: "rgba(255, 255, 255, 0.6)", backdropFilter: "blur(8px)" }}>
              <Typography sx={{ fontSize: 24, mb: 1 }}>⭐</Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: "black", mb: 1 }}>Get High Ratings</Typography>
              <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.7)", mb: 1 }}>
                Maintain excellent ratings from clients
              </Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#3b82f6" }}>+20 points per 5-star review</Typography>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper
              elevation={0}
              sx={{ p: 2.5, borderRadius: 3, bgcolor: "rgba(255, 255, 255, 0.6)", backdropFilter: "blur(8px)" }}>
              <Typography sx={{ fontSize: 24, mb: 1 }}>💰</Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: "black", mb: 1 }}>Increase Earnings</Typography>
              <Typography sx={{ fontSize: 11, color: "rgba(0, 0, 0, 0.7)", mb: 1 }}>
                Higher revenue unlocks milestone bonuses
              </Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#3b82f6" }}>+1 point per $100 earned</Typography>
            </Paper>
          </Grid>
        </Grid>

        <Paper
          elevation={0}
          sx={{
            mt: 3,
            p: 2,
            borderRadius: 3,
            bgcolor: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(8px)",
          }}>
          <Typography sx={{ fontSize: 12, color: "rgba(0, 0, 0, 0.8)" }}>
            <strong>💡 Pro Tip:</strong> Focus on response rate and success rate first - they have the highest impact on your
            level progression and profile visibility!
          </Typography>
        </Paper>
      </Paper>
    </Box>
  );
}
