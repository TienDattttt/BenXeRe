import Typography from "../core/typography";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-200 py-5 flex justify-center">
      <Typography>
        <span>
          &copy; {currentYear} <a href="/">BenXeRe</a>.
        </span>
        <span>&nbsp; All rights reserved.</span>
      </Typography>
    </footer>
  );
};

export default Footer;
