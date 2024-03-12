"use client";

const EmptyStageComponent = ({ heading, desc, subHeading, subItems, more }) => {
    console.log(more)
    return (
        <div className="p-5 my-4 flex flex-col justify-center gap-2 rounded-md border shadow bg-gray-100">
            <h1 className="text-sm font-bold">{heading}</h1>
            <p className="text-sm text-neutral-500 ">{desc}</p>
            <div className="px-2 flex flex-col gap-1">
                <h2 className="text-sm font-bold">{subHeading}</h2>
                <ul className="text-sm flex flex-col gap-2 px-4 text-neutral-500">
                    {
                        subItems?.map((subItem) => (
                            <li key={subItem.id}><span className="text-black font-semibold">{subItem.itemhead}</span> {subItem.item}</li>
                        ))
                    }
                </ul>
                <ul className="text-sm flex flex-col gap-2 px-4 text-neutral-500">
                    {
                        more?.map((moreData) => (
                            <li key={moreData} className="text-black">{moreData.moreInsighthead}</li>
                        ))
                    }
                </ul>
            </div>
        </div>
    );
};

export default EmptyStageComponent;