import Text from "@chakra-ui/react";

export function logEvent(...params) {
    return (
        <Text>
        {params.forEach(p => {
            if (typeof p === "object" && p.name && p.color) {
                return <span style={{ color: p.color }}>{p.name}</span>;
            } else {
                return p;
            }
        })}
        </Text>
    )
}