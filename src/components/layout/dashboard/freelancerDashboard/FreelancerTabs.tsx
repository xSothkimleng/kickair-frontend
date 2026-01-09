import { Box, Tabs, Tab } from "@mui/material";

interface FreelancerTabsProps {
  activeTab: string;
  onTabChange: (tab: unknown) => void;
}

export default function FreelancerTabs({ activeTab, onTabChange }: FreelancerTabsProps) {
  const tabs = [
    { value: "dashboard", label: "Dashboard" },
    { value: "profile", label: "Profile" },
    { value: "services", label: "Services" },
    { value: "finance", label: "Finance" },
    { value: "messages", label: "Messages" },
    { value: "level", label: "Level" },
  ];

  return (
    <Box
      sx={{
        bgcolor: "white",
        borderBottom: 1,
        borderColor: "rgba(0, 0, 0, 0.08)",
      }}>
      <Box sx={{ maxWidth: 1440, mx: "auto", px: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => onTabChange(newValue)}
          sx={{
            minHeight: 48,
            "& .MuiTab-root": {
              fontSize: 13,
              textTransform: "none",
              minHeight: 48,
              color: "rgba(0, 0, 0, 0.6)",
              fontWeight: 400,
              "&.Mui-selected": {
                color: "black",
                fontWeight: 500,
              },
            },
            "& .MuiTabs-indicator": {
              height: 2,
              bgcolor: "black",
            },
          }}>
          {tabs.map(tab => (
            <Tab key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </Tabs>
      </Box>
    </Box>
  );
}
