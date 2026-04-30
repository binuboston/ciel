import type {HeaderQuery} from 'storefrontapi.generated';
import {useUIState} from '~/components/layout/UIStateProvider';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '~/components/ui/Drawer';
import {Logo} from '~/components/ui/Logo';
import {HeaderMenu} from './Header';

interface MobileMenuDrawerProps {
  header: HeaderQuery;
  publicStoreDomain: string;
}

export function MobileMenuDrawer({header, publicStoreDomain}: MobileMenuDrawerProps) {
  const {drawer, close} = useUIState();
  const open = drawer === 'menu';
  const {menu, shop} = header;

  return (
    <Drawer
      open={open}
      onOpenChange={(next) => {
        if (!next) close();
      }}
    >
      <DrawerContent side="left" className="w-full sm:max-w-sm">
        <DrawerHeader>
          <Logo decorative className="h-5 w-auto" />
          <DrawerTitle className="sr-only">Menu</DrawerTitle>
        </DrawerHeader>
        <DrawerBody>
          <HeaderMenu
            menu={menu}
            primaryDomainUrl={shop.primaryDomain?.url}
            publicStoreDomain={publicStoreDomain}
          />
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
