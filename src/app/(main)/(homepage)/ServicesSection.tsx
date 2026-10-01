"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { css } from "styled-system/css";
import { Box, Grid } from "styled-system/jsx";
import { ServiceCard } from "@/components/layout/card/ServiceCard";
import { api } from "@/lib/api";

// How many category cards the homepage shows.
const SHOWN = 6;

// "Landing Pages, WordPress Sites and more": the group's first subcategories.
function describe(children: { category_name: string }[]): string {
  const names = children.slice(0, 2).map(c => c.category_name);
  if (names.length === 0) return "Browse services in this category";
  return children.length > names.length ? `${names.join(", ")} and more` : names.join(" and ");
}

// "View All" pill — white surface, hairline border, accent on hover.
const viewAllBtn = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "2",
  px: "8",
  py: "3.5",
  bg: "surface",
  color: "ink!",
  borderRadius: "pill",
  borderWidth: "2px",
  borderStyle: "solid",
  borderColor: "rgba(0, 0, 0, 0.1)",
  textStyle: "body",
  fontWeight: 600,
  cursor: "pointer",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  transition: "color .15s, border-color .15s",
  _hover: { borderColor: "accent", color: "accent!" },
});

export default function ServicesSection() {
  // The same category groups the Explore page filters by, so every card lands on a
  // list that really is that category. "Something else" is not a browsable group.
  const { data: tree = [] } = useQuery({
    queryKey: ["service-categories", "tree"],
    queryFn: () => api.getCategoryTree(),
    staleTime: 5 * 60_000,
  });
  const groups = tree.filter(c => !c.is_catch_all).slice(0, SHOWN);

  return (
    <Box as="section" bg="canvas">
      <Box maxW="1200px" mx="auto" px={{ base: "6", sm: "12" }} py={{ base: "12", md: "20" }}>
        {/* Header */}
        <Box textAlign="center" mb="12">
          <Box
            as="h2"
            className={css({
              textStyle: { base: "stat", md: "display" },
              fontWeight: 600,
              color: "ink",
              mb: "3",
            })}
          >
            Browse Services
          </Box>
          <Box
            as="p"
            className={css({
              textStyle: { base: "lead", md: "title" },
              color: "ink2",
            })}
          >
            Click any category to find the perfect freelancer
          </Box>
        </Box>

        {/* Category cards */}
        <Grid columns={{ base: 1, sm: 2, md: 3 }} gap="6" mb="8">
          {groups.map(group => (
            <ServiceCard
              key={group.id}
              name={group.category_name}
              description={describe(group.children ?? [])}
              href={`/explore-services?category=${group.id}`}
            />
          ))}
        </Grid>

        {/* View All Services Button */}
        <Box textAlign="center">
          <Link href="/explore-services" className={viewAllBtn}>
            View All Services
            <ArrowRight size={16} />
          </Link>
        </Box>
      </Box>
    </Box>
  );
}
