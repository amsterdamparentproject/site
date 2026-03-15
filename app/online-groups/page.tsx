import { genPageMetadata } from "app/seo";
import RequestGroupsDirectoryAccess from "@/components/RequestGroupsDirectoryAccess";
import SharePageButton from "@/components/SharePageButton";

export const metadata = genPageMetadata({
  title: "Access Online Community Groups",
});

export default function Page() {
  return (
    <div>
      <div className="pt-6 pb-6 flex flex-col items-center">
        <h2 className="text-2xl md:text-3xl font-bold text-brand-soft-green dark:text-brand-goldenrod text-center mb-4 max-w-sm md:max-w-xl">
          Join the
        </h2>
        <h1 className="text-center text-brand-charcoal dark:text-brand-white text-4xl leading-9 font-extrabold tracking-tight md:text-6xl md:leading-14">
          Online Community
          <br /> Groups
        </h1>
      </div>
      <div className="flex flex-col items-center space-y-2 md:pt-4 pb-8 md:space-y-5">
        <p className="max-w-2xl text-center mb-4">
          Did you know there's a huge, thriving online community of 1000+
          Amsterdam parents(-to-be) on WhatsApp and Facebook? There are groups
          by neighborhood and age; groups to buy/sell children's items; groups
          for just moms or dads; and more!
        </p>
        <p className="max-w-2xl text-center mb-4">
          <b className="dark:text-brand-goldenrod">
            This form will give you access to the Amsterdam Parent Community
            Directory,
          </b>{" "}
          with invite links to the online groups. It exists to keep the
          community free of spammers and unwanted promotions. Your information
          will only be used to confirm requests.
        </p>
        <p className="max-w-2xl text-center mb-4">
          After you submit the form,{" "}
          <b className="dark:text-brand-goldenrod">
            you will receive the directory link via email
          </b>
          .{" "}
          <span className="text-brand-violet italic font-bold">
            Please don’t publicly share links to groups or to the directory once
            you have access.
          </span>{" "}
          It's how we keep things safe! If you see someone asking, send them
          this page instead.
        </p>
        <div>
          <SharePageButton />
        </div>

        <div className="w-full max-w-lg my-4">
          <RequestGroupsDirectoryAccess />
        </div>
        <div>
          <p className="max-w-xl text-center italic text-sm mb-6">
            A note on APP's role: APP collaborates with community admins and
            manages the directory, but not the groups themselves. We are not
            responsible for conversations that happen in individual chats;
            please reach out to the specific group admins with questions and
            concerns. A huge thank you to the community admins who moderate the
            chats! ❤️
          </p>
        </div>
      </div>
    </div>
  );
}
