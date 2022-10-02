// import { Button } from '@chakra-ui/button';
// import { useColorMode } from '@chakra-ui/color-mode';
// import { Image } from '@chakra-ui/image';
import { Stack, Flex, Box } from '@chakra-ui/layout';
import { useMediaQuery } from '@chakra-ui/media-query';
import React from 'react';

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
        <Box mt={isNotSmallerScreen ? '0' : 16} align="flex-start"></Box>
      </Flex>
    </Stack>
  );
}

export default Header;
