"use client";
import { useState, useRef, useEffect } from "react";
import Link from "@/components/Link";
import { postSpotlight } from "./PostToWebhook";
import {
  spotlightBioFields,
  spotlightInterviewQuestions,
  spotlightInterviewIntro,
  spotlightInterviewRows,
  spotlightSectionLabel,
  spotlightTypeCopy,
  spotlightOneAskIntro,
  spotlightOneAskQuestion,
  type SpotlightType,
} from "@/data/spotlights/questions";

type Method = "doc" | "form";
type TabId = "info" | "answers" | "photos";

type CustomQA = { question: string; answer: string };

const MAX_PHOTOS = 3;
const MAX_PHOTO_SIZE = 4.5 * 1024 * 1024; // 4.5MB, same safe limit as event images
// Server Actions ship the whole submission (photos included) as one request
// body, capped by next.config.js's serverActions.bodySizeLimit ('6mb', the
// max Netlify's functions allow). MAX_PHOTO_SIZE alone doesn't stop 3 photos
// near that cap from adding up past it, so cap the combined total too —
// 5MB leaves headroom for the rest of the form data.
const MAX_TOTAL_PHOTOS_SIZE = 5 * 1024 * 1024;

// Autosaved draft (everything except photos — files can't survive a
// reload, so they're intentionally left out) lives here so people don't
// lose their answers to a crash or an accidental tab close.
const DRAFT_KEY = "app-spotlight-submit-draft-v1";

const TABS: { id: TabId; label: string }[] = [
  { id: "info", label: "Your info" },
  { id: "answers", label: "Your answers" },
  { id: "photos", label: "Photos" },
];

// Plain-text version of the Bio + Interview questions (no answers) — for
// people who'd rather write their answers in their own doc than on this
// page. Mirrors the .mdx templates' structure so it drops in cleanly.
function buildQuestionTemplateText(type: SpotlightType): string {
  const bioLines = [
    "- Name:",
    ...spotlightBioFields[type].map((f) => `- ${f.label}:`),
  ];
  const interviewLines =
    type === "dearDrMom"
      ? [
          "## [Question you're answering — write it exactly as a parent would ask it; this becomes the article's title]",
          "",
          "",
        ]
      : spotlightInterviewQuestions[type].flatMap((q) => [`## ${q}`, "", ""]);
  return [
    "# Bio",
    ...bioLines,
    "",
    `# ${spotlightSectionLabel[type]}`,
    `(${spotlightInterviewIntro[type]})`,
    "",
    ...interviewLines,
  ].join("\n");
}

type RecentPost = { title: string; href: string };

const SpotlightSubmitForm = ({
  type,
  recentDearDrMom = [],
}: {
  type: SpotlightType;
  recentDearDrMom?: RecentPost[];
}) => {
  const renderedAtRef = useRef(Date.now());
  const honeypotRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Skips the very first (mount) run of the "clear on type change" effect
  // below, so restoring a saved draft doesn't get wiped out immediately.
  const typeMountedRef = useRef(false);
  // True only while the current Occupation/title value is the "Community
  // parent" default we filled in (not something the contributor typed) —
  // lets us clear it back out if they switch away without ever touching it.
  const communityAutoFillRef = useRef(false);

  const [activeTab, setActiveTab] = useState<TabId>("info");
  const [hydrated, setHydrated] = useState(false);
  const [method, setMethod] = useState<Method | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [docLink, setDocLink] = useState("");
  // Optional author-profile fields (author box on the published post) —
  // same shape as data/authors/*.mdx frontmatter (occupation, company,
  // website, instagram, linkedin), collected here since they're the same
  // regardless of spotlight type.
  const [occupation, setOccupation] = useState("");
  const [company, setCompany] = useState("");
  const [website, setWebsite] = useState("");
  const [instagram, setInstagram] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [bioAnswers, setBioAnswers] = useState<Record<string, string>>({});
  const [interviewAnswers, setInterviewAnswers] = useState<
    Record<number, string>
  >({});
  const [ddmQuestion, setDdmQuestion] = useState("");
  const [ddmAnswer, setDdmAnswer] = useState("");
  const [oneAsk, setOneAsk] = useState("");
  const [customQAs, setCustomQAs] = useState<CustomQA[]>([]);
  const [photos, setPhotos] = useState<File[]>([]);

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    occupation: false,
    company: false,
    website: false,
  });
  const [bioTouched, setBioTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [fileError, setFileError] = useState("");
  const [copyLabel, setCopyLabel] = useState("Copy questions");

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const hasAnyInterviewAnswer =
    (type === "dearDrMom"
      ? ddmQuestion.trim() !== "" && ddmAnswer.trim() !== ""
      : Object.values(interviewAnswers).some((v) => v.trim() !== "")) ||
    customQAs.some(
      (qa) => qa.question.trim() !== "" && qa.answer.trim() !== "",
    );

  // Required fields are split across tabs — track each tab's completeness
  // separately so the Submit button (shown at the bottom of every tab) can
  // point people at whichever tab still needs attention.
  // Bio fields flagged `required` (Originally from, Age/gender of
  // children) only apply to the "I'll answer here" method — doc
  // submitters write everything in their own doc instead.
  const hasRequiredBioAnswers = spotlightBioFields[type]
    .filter((f) => f.required)
    .every((f) => (bioAnswers[f.key] || "").trim() !== "");

  // Dear Dr. Mom and Expert Spotlight authors are shown as professionals —
  // occupation/company/website are their reader-facing credibility signal,
  // so those three are required for those two types. Community leaves the
  // whole profile section optional.
  const requiresProfile = type === "dearDrMom" || type === "expert";
  const isInfoValid =
    name.trim() !== "" &&
    isEmailValid &&
    (!requiresProfile ||
      (occupation.trim() !== "" &&
        company.trim() !== "" &&
        website.trim() !== ""));
  const isAnswersValid =
    !!method &&
    (method === "doc"
      ? docLink.trim() !== ""
      : hasAnyInterviewAnswer && hasRequiredBioAnswers);
  const isPhotosValid = photos.length > 0;
  const isFormValid = isInfoValid && isAnswersValid && isPhotosValid;

  const hasInteracted =
    touched.name ||
    touched.email ||
    touched.occupation ||
    touched.company ||
    touched.website ||
    !!method;
  const missingTabLabels = [
    !isInfoValid && "Your info",
    !isAnswersValid && "Your answers",
    !isPhotosValid && "Photos",
  ].filter((v): v is string => !!v);

  // Progress bar: one "step" per tab, all three required to submit.
  const stepsComplete = [isInfoValid, isAnswersValid, isPhotosValid].filter(
    Boolean,
  ).length;
  const progressPercent = Math.round((stepsComplete / TABS.length) * 100);

  // `type` is chosen in the parent's picker grid — clear the
  // type-specific answers whenever it changes underneath us. Skip the
  // first run (mount) so a restored draft isn't immediately wiped.
  useEffect(() => {
    if (!typeMountedRef.current) {
      typeMountedRef.current = true;
      return;
    }
    setBioAnswers({});
    setInterviewAnswers({});
    setDdmQuestion("");
    setDdmAnswer("");
    setOneAsk("");
    setCustomQAs([]);
    setBioTouched({});
  }, [type]);

  // Restore an autosaved draft once, on mount (client-only — localStorage
  // isn't available during server rendering). Type-specific answers only
  // come back if the draft was saved under the type that's active now;
  // otherwise those fields are left for a fresh start rather than risk
  // showing an answer under the wrong question.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw);
        if (typeof draft.name === "string") setName(draft.name);
        if (typeof draft.email === "string") setEmail(draft.email);
        if (typeof draft.occupation === "string") {
          setOccupation(draft.occupation);
          // Restore whether this was the "Community parent" auto-fill (not
          // something the contributor typed) — otherwise, across a reload,
          // the ref below starts fresh as false and the value would look
          // like a real answer, leaking "Community parent" into Expert/DDM
          // the next time the type-change effect runs.
          communityAutoFillRef.current = draft.occupationAutoFilled === true;
        }
        if (typeof draft.company === "string") setCompany(draft.company);
        if (typeof draft.website === "string") setWebsite(draft.website);
        if (typeof draft.instagram === "string") setInstagram(draft.instagram);
        if (typeof draft.linkedin === "string") setLinkedin(draft.linkedin);
        if (draft.method === "doc" || draft.method === "form")
          setMethod(draft.method);
        if (typeof draft.docLink === "string") setDocLink(draft.docLink);
        if (Array.isArray(draft.customQAs)) setCustomQAs(draft.customQAs);
        if (draft.type === type) {
          if (draft.bioAnswers && typeof draft.bioAnswers === "object")
            setBioAnswers(draft.bioAnswers);
          if (
            draft.interviewAnswers &&
            typeof draft.interviewAnswers === "object"
          )
            setInterviewAnswers(draft.interviewAnswers);
          if (typeof draft.ddmQuestion === "string")
            setDdmQuestion(draft.ddmQuestion);
          if (typeof draft.ddmAnswer === "string")
            setDdmAnswer(draft.ddmAnswer);
          if (typeof draft.oneAsk === "string") setOneAsk(draft.oneAsk);
        }
      }
    } catch {
      // corrupt or unavailable storage — just start blank
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Community Spotlights default the author-box "Occupation/title" to
  // "Community parent" — most contributors here aren't submitting under a
  // professional title. Only fills in when the field is empty (never
  // overwrites a restored draft or something the contributor typed), and
  // clears itself back out if they switch to a different type without
  // ever touching it. Waits for `hydrated` so it runs after the restore
  // effect above has applied any saved draft's occupation value first.
  useEffect(() => {
    if (!hydrated) return;
    if (type === "community") {
      if (occupation.trim() === "") {
        setOccupation("Community parent");
        communityAutoFillRef.current = true;
      }
    } else if (communityAutoFillRef.current) {
      setOccupation("");
      communityAutoFillRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, hydrated]);

  // Autosave whenever anything (except photos) changes, once the initial
  // restore above has had a chance to run first.
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          type,
          method,
          name,
          email,
          occupation,
          occupationAutoFilled: communityAutoFillRef.current,
          company,
          website,
          instagram,
          linkedin,
          docLink,
          bioAnswers,
          interviewAnswers,
          ddmQuestion,
          ddmAnswer,
          oneAsk,
          customQAs,
        }),
      );
    } catch {
      // storage full/unavailable (e.g. private browsing) — fail silently
    }
  }, [
    hydrated,
    type,
    method,
    name,
    email,
    occupation,
    company,
    website,
    instagram,
    linkedin,
    docLink,
    bioAnswers,
    interviewAnswers,
    ddmQuestion,
    ddmAnswer,
    oneAsk,
    customQAs,
  ]);

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const combined = [...photos, ...files].slice(0, MAX_PHOTOS);
    const oversized = combined.find((f) => f.size > MAX_PHOTO_SIZE);
    const totalSize = combined.reduce((sum, f) => sum + f.size, 0);
    if (oversized) {
      setFileError(
        `"${oversized.name}" is too large. Please select images under 4.5MB each.`,
      );
    } else if (totalSize > MAX_TOTAL_PHOTOS_SIZE) {
      setFileError(
        `Your photos are too large together (max ${Math.round(MAX_TOTAL_PHOTOS_SIZE / (1024 * 1024))}MB combined). Try fewer or smaller photos.`,
      );
    } else if (photos.length + files.length > MAX_PHOTOS) {
      setFileError(`You can attach up to ${MAX_PHOTOS} photos.`);
      setPhotos(combined);
    } else {
      setFileError("");
      setPhotos(combined);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setFileError("");
  };

  const addCustomQA = () =>
    setCustomQAs((prev) => [...prev, { question: "", answer: "" }]);

  const updateCustomQA = (
    index: number,
    field: keyof CustomQA,
    value: string,
  ) =>
    setCustomQAs((prev) =>
      prev.map((qa, i) => (i === index ? { ...qa, [field]: value } : qa)),
    );

  const removeCustomQA = (index: number) =>
    setCustomQAs((prev) => prev.filter((_, i) => i !== index));

  const copyQuestions = async () => {
    try {
      await navigator.clipboard.writeText(buildQuestionTemplateText(type));
      setCopyLabel("Copied!");
      setTimeout(() => setCopyLabel("Copy questions"), 2000);
    } catch {
      setCopyLabel("Couldn't copy — select & copy manually");
      setTimeout(() => setCopyLabel("Copy questions"), 3000);
    }
  };

  const resetForm = () => {
    setActiveTab("info");
    setMethod(null);
    setName("");
    setEmail("");
    setOccupation("");
    setCompany("");
    setWebsite("");
    setInstagram("");
    setLinkedin("");
    setDocLink("");
    setBioAnswers({});
    setInterviewAnswers({});
    setDdmQuestion("");
    setDdmAnswer("");
    setOneAsk("");
    setCustomQAs([]);
    setPhotos([]);
    setTouched({
      name: false,
      email: false,
      occupation: false,
      company: false,
      website: false,
    });
    setIsSuccess(false);
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      // ignore
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || fileError || !method) return;
    setIsSubmitting(true);

    // Type-specific Bio fields only — the author-profile fields (occupation,
    // company, website, instagram, linkedin) go over as their own discrete
    // fields below instead of folding into this list, since the server
    // needs them separately to build the author .mdx file and the article's
    // "Company" link, not just as a flat label/answer list.
    const typeBio =
      method === "form"
        ? spotlightBioFields[type]
            .map((f) => ({
              label: f.label,
              answer: (bioAnswers[f.key] || "").trim(),
            }))
            .filter((b) => b.answer !== "")
        : [];

    const baseInterview =
      type === "dearDrMom"
        ? ddmQuestion.trim() !== "" && ddmAnswer.trim() !== ""
          ? [{ question: ddmQuestion.trim(), answer: ddmAnswer.trim() }]
          : []
        : spotlightInterviewQuestions[type]
            .map((q, i) => ({
              question: q,
              answer: (interviewAnswers[i] || "").trim(),
            }))
            .filter((qa) => qa.answer !== "");

    const interview = baseInterview.concat(
      customQAs
        .filter((qa) => qa.question.trim() !== "" && qa.answer.trim() !== "")
        .map((qa) => ({
          question: qa.question.trim(),
          answer: qa.answer.trim(),
        })),
    );

    const data = new FormData();
    data.append("type", type);
    data.append("method", method);
    data.append("name", name.trim());
    data.append("email", email.trim());
    data.append("docLink", method === "doc" ? docLink.trim() : "");
    data.append("occupation", occupation.trim());
    data.append("company", company.trim());
    data.append("website", website.trim());
    data.append("instagram", instagram.trim());
    data.append("linkedin", linkedin.trim());
    data.append("bioJSON", JSON.stringify(typeBio));
    data.append(
      "interviewJSON",
      JSON.stringify(method === "form" ? interview : []),
    );
    data.append(
      "oneAsk",
      type === "expert" && method === "form" ? oneAsk.trim() : "",
    );
    data.append("hp_company", honeypotRef.current?.value ?? "");
    data.append("ts", String(renderedAtRef.current));
    photos.forEach((file) => data.append("photos", file));

    try {
      const response = await postSpotlight(data);
      if (response.success) {
        setIsSuccess(true);
        try {
          localStorage.removeItem(DRAFT_KEY);
        } catch {
          // ignore
        }
      } else {
        throw new Error("Submission failed");
      }
    } catch (error) {
      alert(
        "Something went wrong, please try again. If the error persists, please reach out to us at hello@amsterdamparentproject.nl.",
      );
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Styles — matches components/SubmitEventForm.tsx's convention
  const labelStyle = `block tracking-wide text-brand-charcoal dark:text-brand-white text-md font-bold mb-2`;
  const focusStyle = `focus:outline-none focus:ring-0 focus:border-brand-soft-green`;
  const inputBase =
    `appearance-none block w-full bg-white text-brand-charcoal placeholder-gray-500 border rounded py-3 px-4 leading-tight focus:bg-white ` +
    focusStyle;
  const inputStyle = `${inputBase} border-brand-sand`;
  const requiredInputStyle = `${inputBase} border-red-500 bg-red-50/30`;
  const submitButtonStyle =
    `bg-brand-soft-green text-brand-white text-lg mt-2 px-6 py-2 rounded transition-all hover:brightness-105 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ` +
    focusStyle;
  const fileInputStyle =
    `w-full max-w-full appearance-none block bg-white text-brand-charcoal border border-brand-sand rounded cursor-pointer file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:bg-brand-goldenrod file:text-brand-charcoal hover:file:bg-brand-goldenrod hover:file:text-brand-charcoal ` +
    focusStyle;
  const toggleBase = `flex-1 text-center px-4 py-3 rounded border font-medium transition-all ${focusStyle}`;
  const toggleActive = `${toggleBase} bg-brand-soft-green text-brand-white border-brand-soft-green`;
  const toggleInactive = `${toggleBase} bg-white text-brand-charcoal border-brand-sand hover:border-brand-soft-green`;
  const tabActive = `px-4 py-2 -mb-px border-b-2 font-medium text-sm transition-colors border-brand-soft-green text-brand-soft-green dark:text-brand-goldenrod`;
  const tabInactive = `px-4 py-2 -mb-px border-b-2 font-medium text-sm transition-colors border-transparent text-gray-500 hover:text-brand-soft-green`;

  if (isSuccess) {
    return (
      <div className="w-full p-10 text-center bg-brand-soft-green/10 border-2 border-brand-soft-green rounded-lg mb-4">
        <h2 className="text-2xl font-bold text-brand-charcoal dark:text-brand-white mb-2">
          Thank you!
        </h2>
        <p className="text-brand-charcoal dark:text-brand-white mb-4">
          Your submission is on its way to Alex — she'll follow up by email if
          she has any questions.
        </p>
        <button onClick={resetForm} className={submitButtonStyle}>
          Submit another one
        </button>
      </div>
    );
  }

  // Rendered at the bottom of every tab's content, per the requested UX —
  // wherever you are in the form, Submit is right there, and it only
  // enables once every tab's required fields are filled in.
  const submitSection = (
    <div className="flex flex-wrap mb-6 mt-2">
      <div className="w-full px-3">
        <button
          className={submitButtonStyle}
          type="submit"
          disabled={!isFormValid || isSubmitting || !!fileError}
        >
          {isSubmitting
            ? "Sending..."
            : `Submit ${spotlightTypeCopy[type].label}`}
        </button>
        {!isFormValid && !isSubmitting && hasInteracted && (
          <p className="mt-2 text-red-500 text-xs">
            Please complete: {missingTabLabels.join(" and ")}.
          </p>
        )}
      </div>
    </div>
  );

  return (
    <form className="w-full" onSubmit={handleSubmit}>
      {/* Honeypot: hidden from real users, left for bots to fill in */}
      <input
        ref={honeypotRef}
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-9999px",
          width: "1px",
          height: "1px",
          overflow: "hidden",
        }}
      />

      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progress</span>
          <span>
            {stepsComplete} of {TABS.length} sections complete
          </span>
        </div>
        <div className="w-full h-2 bg-brand-sand/40 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-soft-green transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-gray-400 italic">
          Your answers are saved automatically in this browser — except photos,
          which you'll need to re-add if you reload the page.
        </p>
      </div>

      {submitSection}

      <div className="flex border-b border-brand-sand mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={activeTab === tab.id ? tabActive : tabInactive}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "info" && (
        <>
          <div className="flex flex-wrap mb-6">
            <div className="w-full px-3">
              <label className={labelStyle} htmlFor="spotlight-name">
                Your name <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                className={
                  touched.name && !name.trim() ? requiredInputStyle : inputStyle
                }
                id="spotlight-name"
                type="text"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setTouched((p) => ({ ...p, name: true }))}
              />
            </div>
          </div>

          <div className="flex flex-wrap mb-6">
            <div className="w-full px-3">
              <label className={labelStyle} htmlFor="spotlight-email">
                Your email <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                className={
                  touched.email && !isEmailValid
                    ? requiredInputStyle
                    : inputStyle
                }
                id="spotlight-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched((p) => ({ ...p, email: true }))}
              />
              <p className="mt-2 text-gray-500 text-[11px] italic">
                So Alex can follow up with questions or the published link.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap mb-6">
            <div className="w-full px-3">
              <h3 className="font-bold text-lg text-brand-charcoal mb-1">
                For your author profile
              </h3>
              <p className="text-gray-500 text-[13px] italic mb-3">
                This shows up in the author box on your published posts. For
                Community Spotlights, we use "Community parent" by default.
              </p>

              <div className="mb-4">
                <label className={labelStyle} htmlFor="profile-occupation">
                  Occupation/title
                  {requiresProfile && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                <input
                  className={
                    requiresProfile && touched.occupation && !occupation.trim()
                      ? requiredInputStyle
                      : inputStyle
                  }
                  id="profile-occupation"
                  type="text"
                  placeholder="e.g. Founder"
                  value={occupation}
                  onChange={(e) => {
                    communityAutoFillRef.current = false;
                    setOccupation(e.target.value);
                  }}
                  onBlur={() => setTouched((p) => ({ ...p, occupation: true }))}
                />
              </div>

              <div className="mb-4">
                <label className={labelStyle} htmlFor="profile-company">
                  Company/practice
                  {requiresProfile && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                <input
                  className={
                    requiresProfile && touched.company && !company.trim()
                      ? requiredInputStyle
                      : inputStyle
                  }
                  id="profile-company"
                  type="text"
                  placeholder="e.g. Amsterdam Parent Project"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  onBlur={() => setTouched((p) => ({ ...p, company: true }))}
                />
              </div>

              <div className="mb-4">
                <label className={labelStyle} htmlFor="profile-website">
                  Website
                  {requiresProfile && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                <input
                  className={
                    requiresProfile && touched.website && !website.trim()
                      ? requiredInputStyle
                      : inputStyle
                  }
                  id="profile-website"
                  type="text"
                  placeholder="https://yoursite.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  onBlur={() => setTouched((p) => ({ ...p, website: true }))}
                />
              </div>

              <div className="mb-4">
                <label className={labelStyle} htmlFor="profile-instagram">
                  Instagram
                </label>
                <input
                  className={inputStyle}
                  id="profile-instagram"
                  type="text"
                  placeholder="https://instagram.com/yourhandle"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                />
              </div>

              <div className="mb-2">
                <label className={labelStyle} htmlFor="profile-linkedin">
                  LinkedIn
                </label>
                <input
                  className={inputStyle}
                  id="profile-linkedin"
                  type="text"
                  placeholder="https://linkedin.com/in/you"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === "answers" && (
        <>
          <div className="flex flex-wrap mb-6">
            <div className="w-full px-3">
              <p className={labelStyle}>
                How do you want to share your answers?{" "}
                <span className="text-red-500 ml-1">*</span>
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  className={method === "doc" ? toggleActive : toggleInactive}
                  onClick={() => setMethod("doc")}
                >
                  I'll share a doc
                </button>
                <button
                  type="button"
                  className={method === "form" ? toggleActive : toggleInactive}
                  onClick={() => setMethod("form")}
                >
                  I'll answer here
                </button>
              </div>
            </div>
          </div>

          {method === "doc" && (
            <>
              <div className="flex flex-wrap mb-6">
                <div className="w-full px-3">
                  <label className={labelStyle} htmlFor="spotlight-doc-link">
                    Link to your doc{" "}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    className={inputStyle}
                    id="spotlight-doc-link"
                    type="text"
                    placeholder="https://docs.google.com/document/d/..."
                    value={docLink}
                    onChange={(e) => setDocLink(e.target.value)}
                  />
                  <p className="mt-2 text-gray-500 text-[11px] italic">
                    Make sure the link is set to "Anyone with the link can
                    view."
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap mb-6">
                <div className="w-full px-3 bg-brand-white/60 border border-brand-sand rounded p-4">
                  <p className="text-brand-charcoal text-sm mb-3">
                    Writing your answers in your own doc? Grab the Bio +
                    Interview questions below to paste in — answer whichever
                    ones inspire you, and feel free to add your own.
                  </p>
                  <button
                    type="button"
                    onClick={copyQuestions}
                    className={submitButtonStyle}
                  >
                    {copyLabel}
                  </button>
                </div>
              </div>
            </>
          )}

          {method === "form" && (
            <>
              <div className="flex flex-wrap mb-6">
                <div className="w-full px-3">
                  <h3 className="font-bold text-lg text-brand-charcoal mb-3">
                    Bio
                  </h3>
                  {spotlightBioFields[type].map((f) => (
                    <div key={f.key} className="mb-4">
                      <label className={labelStyle} htmlFor={`bio-${f.key}`}>
                        {f.label}
                        {f.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </label>
                      <input
                        className={
                          f.required &&
                          bioTouched[f.key] &&
                          !(bioAnswers[f.key] || "").trim()
                            ? requiredInputStyle
                            : inputStyle
                        }
                        id={`bio-${f.key}`}
                        type="text"
                        placeholder={f.placeholder}
                        value={bioAnswers[f.key] || ""}
                        onChange={(e) =>
                          setBioAnswers((prev) => ({
                            ...prev,
                            [f.key]: e.target.value,
                          }))
                        }
                        onBlur={() =>
                          setBioTouched((prev) => ({ ...prev, [f.key]: true }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              {type === "expert" && (
                <div className="flex flex-wrap mb-6">
                  <div className="w-full px-3">
                    <h3 className="font-bold text-lg text-brand-charcoal mb-1">
                      The One Ask
                    </h3>
                    <p className="text-gray-500 text-[13px] italic mb-3">
                      {spotlightOneAskIntro} ❤️
                    </p>
                    <label className={labelStyle} htmlFor="one-ask">
                      {spotlightOneAskQuestion}
                    </label>
                    <textarea
                      className={inputStyle}
                      id="one-ask"
                      rows={3}
                      placeholder="Optional — skip if nothing comes to mind"
                      value={oneAsk}
                      onChange={(e) => setOneAsk(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-wrap mb-2">
                <div className="w-full px-3">
                  <h3 className="font-bold text-lg text-brand-charcoal mb-1">
                    {spotlightSectionLabel[type]}
                    {type !== "dearDrMom" && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </h3>
                  <p className="text-gray-500 text-[13px] italic mb-3">
                    {spotlightInterviewIntro[type]}
                  </p>

                  {type === "dearDrMom" && (
                    <>
                      {recentDearDrMom.length > 0 && (
                        <div className="mb-4 bg-brand-white/60 border border-brand-sand rounded p-4">
                          <p className="text-brand-charcoal text-sm mb-2 font-medium">
                            For reference, our most recent Dear Dr. Mom
                            articles:
                          </p>
                          <ul className="list-disc list-inside space-y-1">
                            {recentDearDrMom.map((post) => (
                              <li key={post.href}>
                                <Link
                                  href={post.href}
                                  target="_blank"
                                  className="text-brand-goldenrod hover:text-brand-soft-green underline"
                                >
                                  {post.title}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="mb-4">
                        <label className={labelStyle} htmlFor="ddm-question">
                          Question you're answering{" "}
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                          className={inputStyle}
                          id="ddm-question"
                          type="text"
                          placeholder="Write it exactly as a parent would ask it — this becomes the article's title"
                          value={ddmQuestion}
                          onChange={(e) => setDdmQuestion(e.target.value)}
                        />
                      </div>

                      <div className="mb-4">
                        <label className={labelStyle} htmlFor="ddm-answer">
                          Your answer{" "}
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <textarea
                          className={inputStyle}
                          id="ddm-answer"
                          rows={spotlightInterviewRows[type]}
                          placeholder="Write your full answer here"
                          value={ddmAnswer}
                          onChange={(e) => setDdmAnswer(e.target.value)}
                        />
                      </div>
                    </>
                  )}

                  {spotlightInterviewQuestions[type].map((q, i) => (
                    <div key={i} className="mb-4">
                      <label className={labelStyle} htmlFor={`interview-${i}`}>
                        {q}
                      </label>
                      <textarea
                        className={inputStyle}
                        id={`interview-${i}`}
                        rows={spotlightInterviewRows[type]}
                        placeholder={
                          type === "dearDrMom"
                            ? "Write your full answer here"
                            : "Optional — skip if it doesn't inspire you"
                        }
                        value={interviewAnswers[i] || ""}
                        onChange={(e) =>
                          setInterviewAnswers((prev) => ({
                            ...prev,
                            [i]: e.target.value,
                          }))
                        }
                      />
                    </div>
                  ))}

                  {customQAs.map((qa, i) => (
                    <div
                      key={i}
                      className="mb-4 border-l-2 border-brand-goldenrod pl-4"
                    >
                      <label className={labelStyle} htmlFor={`custom-q-${i}`}>
                        Your own question
                      </label>
                      <input
                        className={`${inputStyle} mb-2`}
                        id={`custom-q-${i}`}
                        type="text"
                        placeholder="Write your own question"
                        value={qa.question}
                        onChange={(e) =>
                          updateCustomQA(i, "question", e.target.value)
                        }
                      />
                      <textarea
                        className={inputStyle}
                        rows={3}
                        placeholder="Your answer"
                        value={qa.answer}
                        onChange={(e) =>
                          updateCustomQA(i, "answer", e.target.value)
                        }
                      />
                      <button
                        type="button"
                        onClick={() => removeCustomQA(i)}
                        className="mt-2 text-red-500 text-xs underline"
                      >
                        Remove
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addCustomQA}
                    className="mb-6 text-brand-soft-green hover:text-brand-goldenrod font-medium text-sm underline"
                  >
                    + Add your own question
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {activeTab === "photos" && (
        <>
          <div className="flex flex-wrap mb-6">
            <div className="w-full px-3">
              <label htmlFor="spotlight-photos" className={labelStyle}>
                Upload up to {MAX_PHOTOS} photos of you
                {type === "community"
                  ? " and your child (can be facing away!)"
                  : type === "dearDrMom"
                    ? " — we'll use one as your author photo"
                    : ", optionally with your child(ren)"}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <p className="text-gray-500 text-[13px] italic mb-2">
                At least 1 photo is required (
                {Math.round(MAX_TOTAL_PHOTOS_SIZE / (1024 * 1024))}MB combined
                limit across all photos).
              </p>
              <input
                className={fileInputStyle}
                type="file"
                id="spotlight-photos"
                accept="image/*"
                multiple
                onChange={handleFilesChange}
                ref={fileInputRef}
                disabled={photos.length >= MAX_PHOTOS}
              />
              {fileError && (
                <p className="mt-2 text-red-500 text-[11px]">{fileError}</p>
              )}
              {photos.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {photos.map((file, i) => (
                    <li
                      key={`${file.name}-${i}`}
                      className="flex items-center justify-between text-sm text-brand-charcoal bg-brand-white/60 border border-brand-sand rounded px-3 py-2"
                    >
                      <span className="truncate">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        className="ml-3 text-red-500 text-xs underline shrink-0"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </form>
  );
};

export default SpotlightSubmitForm;
