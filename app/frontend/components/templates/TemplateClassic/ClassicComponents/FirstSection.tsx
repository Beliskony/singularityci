// ============ TemplateClassic/ClassicComponents/principal/FirstSection.tsx ============
import type { ClassicImages } from "../classicConfig";

interface FirstSectionProps {
  groomName: string;
  brideName: string;
  heroImage?: string;
  imgs: ClassicImages;
}

const FirstSection = ({ groomName, brideName, heroImage, imgs }: FirstSectionProps) => {
  return (
    <section className="relative isolate w-full min-h-screen bg-(--c-firstBg) overflow-hidden lg:flex lg:items-center lg:justify-center lg:py-10">
      <div
        className="relative w-full min-h-screen bg-(--c-firstCardBg) rounded-t-[160px] flex flex-col items-center mt-5 pt-5 pb-10
                   sm:max-w-md sm:mx-auto
                   lg:min-h-0 lg:max-w-sm lg:mt-0 lg:pt-8 lg:pb-14 lg:rounded-[160px] lg:shadow-2xl"
      >
        <img
          src={imgs.firstTopImageUrl}
          alt=""
          className="anim-item anim-item--1 w-full -mt-20 select-none pointer-events-none lg:-mt-10"
        />

        <div className="anim-item anim-item--2 flex flex-col items-center -mt-2 leading-[0.85] font-script">
          <span className="text-5xl sm:text-6xl lg:text-6xl text-(--c-firstNamesColor)">{groomName}</span>
          <span className="text-2xl sm:text-3xl lg:text-3xl my-1 text-(--c-firstAmpColor)">&</span>
          <span className="text-5xl sm:text-6xl lg:text-6xl text-(--c-firstNamesColor)">{brideName}</span>
        </div>

        <div className="anim-item anim-item--3 relative w-[85%] max-w-xs aspect-square mt-6 lg:max-w-65">
          {heroImage ? (
            <img src={heroImage} alt={`${groomName} & ${brideName}`} className="w-full h-full object-cover rounded-full" />
          ) : (
            <div className="w-full h-full rounded-full bg-(--c-firstPhotoBg)/20" />
          )}
          <img
            src={imgs.firstFlowersImageUrl}
            alt=""
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[130%] max-w-none select-none pointer-events-none"
          />
        </div>
      </div>
    </section>
  );
};

export default FirstSection;