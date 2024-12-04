"use client";

import type { NextPage } from "next";
import Link from "next/link";
import Main from "src/layouts/Main";

const faqs = [
  {
    question: "What are daylight savings and how do they affect me?",
    answer: `
    The idea of Daylight Savings is to move clocks one hour ahead of the "standard" time in summer and one hour back in winter. Normally in the summer sun would rise very early (depending on your latitude) eg., at 5 am, the daylight then can be thought of as not being used since very few people are going to be awake. So DST moves sunrise and sunset an hour later so that the time we have daylight is of more use.
    <br/>
    It's decided by the Governments of the countries to follow or not follow Daylight savings. Some countries that do follow are: Canada, United States, Australia, New Zealand, etc. You would already know if you have been following Daylight Savings in the country you're residing.
    <br/>
    The way it would affect you as an attendee of any Convo on this website is that if the proposer is taking sessions from a Country that follows Daylight Savings, you can expect sessions to be off by an hour (earlier or later depending on the part of the year). If you are a proposer, however, it's recommended that you add a little note in the description that mentions that some sessions would be affected by daylight savings.
    `,
  },
  {
    question: "Why is there an email field?",
    answer: `
    The events where the proposer chooses to create a google calendar event are the events that would request email from an attendee. That field however is optional. You can choose to not fill in your email, however, you do risk of losing track of any updates that happen on the event.
    `,
  },
];

const About: NextPage = () => {
  const createMarkup = (html: string | undefined | null) => {
    return {
      __html: html ? html : "",
    };
  };
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
            text-4xl
            font-extrabold
            text-primary dark:text-primary-dark
            sm:text-5xl
          "
            >
              FAQs.
            </div>
          </div>
          <div className="mt-12">
            {faqs.map((faq, key) => {
              const id = faq.question
                .replace(/[^a-zA-Z ]/g, "")
                .replace(/\s+/g, "-")
                .toLowerCase();
              return (
                <section id={id} key={key} className="mb-6">
                  <Link href={`#${id}`}>
                    <h1 className="font-robotoSlab text-2xl text-kernel-light hover:text-kernel">
                      <span className="-ml-7 mr-3">#</span>
                      {faq.question}
                    </h1>
                  </Link>
                  <article className="prose prose-lg dark:prose-invert">
                    <div
                      dangerouslySetInnerHTML={createMarkup(faq.answer)}
                    ></div>
                  </article>
                </section>
              );
            })}
          </div>
        </div>
      </Main>
    </>
  );
};

export default About;
