import { IconButton } from '@chakra-ui/button';
import { useColorMode } from '@chakra-ui/color-mode';
import { Flex, VStack, Heading, Spacer } from '@chakra-ui/layout';
import { FaSun, FaMoon } from 'react-icons/fa';
import Header from '../components/Header';
import { Cookies } from 'react-cookie';

function Home() {
  const { colorMode, toggleColorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  const cookies = new Cookies();
  cookies.set('token', '', { path: '/', secure: true, sameSite: 'none' });

  return (
    <VStack p={5}>
      <Flex w="100%">
        <Heading
          ml="8"
          size="md"
          fontWeight="semibold"
          color="cyan.400"
          bgGradient="linear(to-r, cyan.400, blue.500)"
          bgClip="text"
        >
          Nanocraft
        </Heading>

        <Spacer></Spacer>
        <IconButton
          ml={8}
          icon={isDark ? <FaSun /> : <FaMoon />}
          isRound="true"
          onClick={toggleColorMode}
        ></IconButton>
      </Flex>
      <Header></Header>
    </VStack>
  );
}

export default Home;
