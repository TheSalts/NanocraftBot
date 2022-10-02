import { Button } from '@chakra-ui/button';
// import { useColorMode } from '@chakra-ui/color-mode';
// import { Image } from '@chakra-ui/image';
import { Stack, Flex, Box, Text } from '@chakra-ui/layout';
import { useMediaQuery } from '@chakra-ui/media-query';
import React from 'react';

// import crypto from 'crypto';

function sendAuthToDiscord() {
  window.location.href = '/auth';
}

function Header() {
  // const { colorMode } = useColorMode();
  // const isDark = colorMode === 'dark';

  const [isNotSmallerScreen] = useMediaQuery('(min-width:600px)');

  return (
    <Stack>
      <Flex
        direction={isNotSmallerScreen ? 'row' : 'column'}
        spacing="200px"
        p={isNotSmallerScreen ? '32' : '0'}
        alignSelf="flex-start"
      >
        <Box mt={isNotSmallerScreen ? '0' : 16} align="flex-start">
          <Text fontSize="5xl" fontWeight="semibold">
            NANOCRAFT SMP
          </Text>
          <Text
            fontSize="7xl"
            fontWeight="bold"
            bgGradient="linear(to-r, cyan.400, blue.500, purple.600)"
            bgClip="text"
          >
            Control Panel
          </Text>
          {/* <Text color={isDark ? 'gray.200' : 'gray.500'}>
            GDE - Flutter, Firebase. Founder of https://codepur.dev &
            https://velocityx.dev. Building @frontierdotxyz, YouTuber &
            Entrepreneur 🗣
          </Text> */}
          <Button
            mt={8}
            colorScheme="messenger"
            onClick={sendAuthToDiscord}
            fontWeight="semibold"
          >
            디스코드로 로그인
          </Button>
        </Box>
        {/* <Image
          alignSelf="center"
          mt={isNotSmallerScreen ? '0' : '12'}
          mb={isNotSmallerScreen ? '0' : '12'}
          borderRadius="full"
          backgroundColor="transparent"
          boxShadow="lg"
          boxSize="300px"
          src="https://avatars.githubusercontent.com/u/12619420?v=4"
        /> */}
      </Flex>
    </Stack>
  );
}

export default Header;
