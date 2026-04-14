import { Flex, Heading, Image, Text, Link } from "@chakra-ui/react"
import scLogo from "../assets/survivalcomp.png";
import { FaGithub } from "react-icons/fa";
import { LuExternalLink } from "react-icons/lu"

const AppHeader = () => {
    return (
        <>
            <Flex justifyContent={'center'} alignItems={'center'} gap={3} flexWrap={'wrap'}>
            <Heading fontSize={'4xl'} padding="5px" color={'green'}>Survivalcomp Hub</Heading>
            <Image src={scLogo} height="50px" className="logo" alt="Survivalcomp logo" />
            </Flex>
            <Text>A web app dedicated to the simulation of various survival competitions.</Text>
            <Text>You can add players, import profiles from JSON files, and simulate game turns to see who gets eliminated.</Text>
            <Text>Created by GreenieGuest, Inspired by BrantSteele</Text>
            <Link href="https://github.com/GreenieGuest/Survivalcomp-Hub">
            <FaGithub /> Github Repository <LuExternalLink />
            </Link>
        </>
    )
}
export { AppHeader };