export namespace formats {
    namespace tall {
        let width: number;
        let height: number;
        namespace style {
            let standard: string;
            let minimal: string;
            let transparent: string;
        }
    }
    namespace wide {
        let width_1: number;
        export { width_1 as width };
        let height_1: number;
        export { height_1 as height };
        export namespace style_1 {
            let standard_1: string;
            export { standard_1 as standard };
            let minimal_1: string;
            export { minimal_1 as minimal };
            let transparent_1: string;
            export { transparent_1 as transparent };
        }
        export { style_1 as style };
    }
    namespace square {
        let width_2: number;
        export { width_2 as width };
        let height_2: number;
        export { height_2 as height };
        export namespace style_2 {
            let standard_2: string;
            export { standard_2 as standard };
            let minimal_2: string;
            export { minimal_2 as minimal };
            let transparent_2: string;
            export { transparent_2 as transparent };
        }
        export { style_2 as style };
    }
}
export const defaultFormat: "square";
export const defaultStyle: "standard";
