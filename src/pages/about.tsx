import type { NextPage } from "next";
import Main from "src/layouts/Main";
type Faq = {
  question: string;
  answer: string;
};
const About: NextPage = () => {
  const faqs: Faq[] = [
    {
      question: "What are Daylight Savings and how do they affect me?",
      answer: `
        The idea of Daylight Savings is to move clocks one hour ahead of the "standard" time in summer and one hour back in winter. Normally in the summer sun would rise very early (depending on your latitude) eg., at 5 am, the daylight then can be thought of as not being used since very few people are going to be awake. So DST moves sunrise and sunset an hour later so that the time we have daylight is of more use. It's decided by the Governments of the countries to follow or not follow Daylight savings. Some countries that do follow are: Canada, United States, Australia, New Zealand, etc. You would already know if you have been following Daylight Savings in the country you're residing. The way it would affect you as an attendee of any Convo on this website is that if the proposer is taking sessions from a Country that follows Daylight Savings, you can expect sessions to be off by an hour (earlier or later depending on the part of the year). If you are a proposer, however, it's recommended that you add a little note in the description that mentions that some sessions would be affected by daylight savings.
      `,
    },
  ];
  return (
    <>
      <Main className="mx-auto px-4">
        <div
          className="
          pl-6
          md:px-12
          lg:px-32
        "
        >
          <div className="flex flex-col items-center justify-center">
            <div
              className="
            mx-auto
            font-heading
            text-5xl
            font-extrabold
            text-primary
            sm:text-5xl
          "
            >
              About
            </div>
            <div className="my-12 w-full border border-primary lg:w-9/12"></div>
          </div>
          <div className="font-primary lg:px-32">
            <div className="pb-4">
              Convo is intended to help any community of care craft beautiful
              conversations. This is a convivial tool which works with us and
              helps us help each other. We know that cultivating creative,
              diverse and trusted spaces in which people can be honest and
              vulnerable is no small task. Convo helps us grow environments for
              dialogue by easing the coordination required, so we can spend our
              time and energy where it really matters: relating with other
              people from the heart.
            </div>
            <div className="mt-5 font-heading text-4xl">FAQs</div>
            {faqs.map((faq, key) => {
              return (
                <div key={key} className="py-4">
                  <div className="mb-3 bg-highlight font-heading text-2xl font-bold">
                    {faq.question}
                  </div>
                  <div className="prose max-w-none font-primary text-base">
                    {faq.answer}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Main>
    </>
  );
};

export default About;
