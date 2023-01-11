import { IconButton } from '@chakra-ui/button';
import { useColorMode } from '@chakra-ui/color-mode';
import { Flex, VStack, Spacer } from '@chakra-ui/layout';
import { FaSun, FaMoon } from 'react-icons/fa';
import React from 'react';
import SideBar from '../components/sidebar';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

function ConsolePage() {
  const { colorMode, toggleColorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  const { id } = useParams();
  const navigate = useNavigate();

  if (!id) {
    return navigate('/');
  }

  return (
    <VStack>
      <Flex w="100%">
        <SideBar></SideBar>
        <Spacer></Spacer>
        <IconButton
          mr="5"
          my="5"
          icon={isDark ? <FaSun /> : <FaMoon />}
          isRound="true"
          onClick={toggleColorMode}
        ></IconButton>
      </Flex>
    </VStack>
  );
}

export default ConsolePage;
