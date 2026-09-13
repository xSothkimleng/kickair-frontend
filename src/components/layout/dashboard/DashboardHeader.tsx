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
      <Container maxW="1200px" px="24px" py="24px">
        <div>
          <h4 className={titleCss}>{title}</h4>
          <p className={descriptionCss}>{description}</p>
        </div>
      </Container>
    </div>
  );
}
