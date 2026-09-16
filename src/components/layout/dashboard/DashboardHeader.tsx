import { css } from "styled-system/css";
import { Container } from "styled-system/jsx";

type DashboardHeaderProps = {
  title: string;
  description?: string;
};

const wrapCss = css({
  bg: "surface",
  borderBottomWidth: "1px",
  borderBottomStyle: "solid",
  borderBottomColor: "hairline",
});

const titleCss = css({
  textStyle: "stat",
  fontWeight: 600,
  color: "ink",
});

const descriptionCss = css({ textStyle: "body", color: "ink2" });

export default function DashboardHeader({ title, description }: DashboardHeaderProps) {
  return (
    <div className={wrapCss}>
      {/* border-box, like the tab strip and page content: the 24px padding
          must sit inside the 1200px width or the title lands 24px left of
          the logo. */}
      <Container maxW="1200px" px="24px" py="24px" boxSizing="border-box">
        <div>
          <h4 className={titleCss}>{title}</h4>
          <p className={descriptionCss}>{description}</p>
        </div>
      </Container>
    </div>
  );
}
