import { Box, Tabs, Tab, Container } from "@mui/material";

interface FreelancerTabsProps {
  activeTab: string;
  onTabChange: (tab: unknown) => void;
  tabs?: { value: string; label: string }[];
}

export default function FreelancerTabs({ activeTab, onTabChange, tabs }: FreelancerTabsProps) {
  return (
    <Box
      sx={{
        bgcolor: "white",
        borderBottom: 1,
        borderColor: "rgba(0, 0, 0, 0.08)",
      }}>
      <Container sx={{ px: 3 }}>
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
          {tabs && tabs.map(tab => <Tab key={tab.value} value={tab.value} label={tab.label} />)}
        </Tabs>
      </Container>
    </Box>
  );
}
