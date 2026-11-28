export interface GraphicGalleryProps {
    /** Rows (one per layout), each with a picture per column (one per size). */
    rows: { label: string; images: { label: string; image: string }[] }[];
}

/**
 * Every layout at every size, side by side: the page for checking a new
 * layout (Storybook only; see the add-graphic-layout skill). Pictures are
 * drawn by the real engine.
 */
export function GraphicGallery({ rows }: GraphicGalleryProps) {
    return (
        <div className="flex flex-col gap-10 p-6">
            {rows.map((row) => (
                <section key={row.label} className="flex flex-col gap-3">
                    <h2 className="font-heading text-lg font-semibold">
                        {row.label}
                    </h2>
                    <div className="flex flex-wrap items-start gap-4">
                        {row.images.map((cell) => (
                            <figure
                                key={cell.label}
                                className="flex flex-col gap-1"
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element -- drawn in the browser */}
                                <img
                                    src={cell.image}
                                    alt={`${row.label}, ${cell.label}`}
                                    className="h-72 w-auto border shadow-sm"
                                />
                                <figcaption className="text-sm">
                                    {cell.label}
                                </figcaption>
                            </figure>
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}
