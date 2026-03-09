import { toast } from "react-hot-toast"
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { useEffect, useRef, useState } from "react"

const RenderStep2 = ({ isLoadingTypes, consultationTypesData, selectedType, setSelectedType }) => {
    const scrollContainerRef = useRef(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);

    const checkScroll = () => {
        const container = scrollContainerRef.current;
        if (container) {
            setShowLeftArrow(container.scrollLeft > 0);
            setShowRightArrow(
                container.scrollLeft + container.clientWidth < container.scrollWidth - 10
            );
        }
    };

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (container) {
            checkScroll();
            container.addEventListener('scroll', checkScroll);

            const handleWheel = (e) => {
                if (e.deltaY !== 0) {
                    container.scrollLeft += e.deltaY;
                    e.preventDefault();
                }
            };

            container.addEventListener('wheel', handleWheel);

            return () => {
                container.removeEventListener('scroll', checkScroll);
                container.removeEventListener('wheel', handleWheel);
            };
        }
    }, [consultationTypesData]);

    const scroll = (direction) => {
        const container = scrollContainerRef.current;
        if (container) {
            const scrollAmount = 300;
            container.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="relative">
            <h3 className="text-lg font-bold text-white mb-4">Choose Consultation Type</h3>

            {isLoadingTypes ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 size={32} className="animate-spin text-primary mb-3" />
                    <p className="text-gray-400">Loading consultation options...</p>
                </div>
            ) : (
                <>
                    {showLeftArrow && (
                        <button
                            onClick={() => scroll('left')}
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gray-800/80 hover:bg-gray-700/80 p-2 rounded-full backdrop-blur-sm border border-gray-700"
                        >
                            <ChevronLeft className="text-white" size={24} />
                        </button>
                    )}

                    <div
                        ref={scrollContainerRef}
                        className="flex gap-4 overflow-x-auto pb-4 scroll-smooth"
                        style={{
                            scrollbarWidth: 'thin',
                            scrollbarColor: '#3b82f6 #1f2937'
                        }}
                    >
                        <style jsx>{`
                            .overflow-x-auto::-webkit-scrollbar {
                                height: 6px;
                            }
                            .overflow-x-auto::-webkit-scrollbar-track {
                                background: #1f2937;
                                border-radius: 4px;
                            }
                            .overflow-x-auto::-webkit-scrollbar-thumb {
                                background: #3b82f6;
                                border-radius: 4px;
                            }
                            .overflow-x-auto::-webkit-scrollbar-thumb:hover {
                                background: #2563eb;
                            }
                        `}</style>

                        {consultationTypesData?.data?.map((type) => (
                            <div
                                key={type.id}
                                onClick={() => {
                                    setSelectedType(type.id)
                                    toast.success(`Selected ${type.title}`)
                                }}
                                className={`
                                    flex-shrink-0 w-80 p-4 rounded-sm border cursor-pointer transition group
                                    ${selectedType === type.id
                                        ? 'border-primary bg-primary/5 ring-2 ring-primary/30'
                                        : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800'
                                    }
                                `}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{type.icon}</span>
                                        <div className="text-left">
                                            <h4 className="font-bold text-white">{type.title}</h4>
                                            <p className="text-sm text-gray-400">{type.duration}</p>
                                            {type.description && (
                                                <p className="text-xs text-gray-500 mt-1">{type.description}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-white">{type.price}</div>
                                        {type.price === 'FREE' && (
                                            <div className="text-xs text-[#00FF88] bg-[#00FF88]/10 px-2 py-0.5 rounded mt-1">
                                                RECOMMENDED
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {showRightArrow && (
                        <button
                            onClick={() => scroll('right')}
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gray-800/80 hover:bg-gray-700/80 p-2 rounded-full backdrop-blur-sm border border-gray-700"
                        >
                            <ChevronRight className="text-white" size={24} />
                        </button>
                    )}
                </>
            )}
        </div>
    )
}

export default RenderStep2;