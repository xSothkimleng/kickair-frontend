import HeroSection from "./HeroSection";
import ServicesSection from "./ServicesSection";
import { freelancers, serviceCategories } from "../../data/mockdata";
import ExploreFreelancersSection from "./FreelancersSection";
import FreelancerEmpowermentSection from "./FreelancerEmpowermentSection";
import FindStableJobsSection from "./FindStableJobsSection";
import KickAirProSection from "./KickAirProSection";
import SuccessStoriesSection from "./SuccessStoriesSection";
import ReviewsSection from "./ReviewsSection";
import TrustReviewSystemSection from "./TrustReviewSystemSection";
import HowItWorksSection from "./HowItWorkSection";
import KickAirUniversitySection from "./KickAirUniversitySection";
import FaqSection from "./FAQSection";
import FinalCtaSection from "./FinalCTASection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <ServicesSection serviceCategories={serviceCategories} />
      <ExploreFreelancersSection freelancers={freelancers} />
      <FreelancerEmpowermentSection />
      <FindStableJobsSection />
      <KickAirProSection />
      <SuccessStoriesSection />
      <ReviewsSection />
      <TrustReviewSystemSection />
      <HowItWorksSection />
      <KickAirUniversitySection />
      <FaqSection />
      <FinalCtaSection />
    </>
  );
}
