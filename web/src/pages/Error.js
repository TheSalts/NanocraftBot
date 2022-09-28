import { IconButton } from '@chakra-ui/button';
import { useColorMode } from '@chakra-ui/color-mode';
import { Flex, VStack, Heading, Spacer } from '@chakra-ui/layout';
import { FaSun, FaMoon } from 'react-icons/fa';
import Err from '../components/Err';

function Error() {
  const { colorMode, toggleColorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  return (
    <VStack p={5}>
      <Flex w="100%">
        <Heading ml="8" size="md" fontWeight="semibold" color="cyan.400">
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
      <Err></Err>
    </VStack>
  );
}

export default Error;
