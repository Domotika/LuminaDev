
import { Device, DeviceType, Room } from './types';

export const MOCK_ROOMS: Room[] = [
  {
    id: 'living',
    name: 'Sala de Estar',
    // Luxury Living Room
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1920&q=80',
    deviceIds: ['d1', 'd2', 'ac1', 'd4', 'avr1', 'lgtv1', 's1', 'd12', 'b1']
  },
  {
    id: 'kitchen',
    name: 'Cozinha Gourmet',
    // Luxury Kitchen
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80',
    deviceIds: ['d5', 'd6']
  },
  {
    id: 'master',
    name: 'Suíte Master',
    // Luxury Bedroom
    image: 'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&w=1920&q=80',
    deviceIds: ['d7', 'd8', 'd9', 's3']
  },
  {
    id: 'theater',
    name: 'Home Theater',
    // Home Cinema / Media Room
    image: 'https://images.unsplash.com/photo-1595769816263-9b910be24d5f?auto=format&fit=crop&w=1920&q=80',
    deviceIds: ['d10', 'd11', 's2']
  },
  {
    id: 'entry',
    name: 'Entrada Principal',
    image: 'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?auto=format&fit=crop&w=1920&q=80',
    deviceIds: ['d13', 'd14']
  }
];

export const MOCK_DEVICES: Record<string, Device> = {
  // Living
  'd1': { id: 'd1', hubitatId: '101', name: 'Lustre Principal', type: DeviceType.DIMMER, roomId: 'living', state: { isOn: true, level: 80 } },
  'd2': { id: 'd2', hubitatId: '102', name: 'Abajur Canto', type: DeviceType.LIGHT, roomId: 'living', state: { isOn: false } },
  
  // AC Mock
  'ac1': { id: 'ac1', hubitatId: '103', name: 'Ar Condicionado', type: DeviceType.AC, roomId: 'living', state: { isOn: true, temperature: 24, setpoint: 22, mode: 'cool', fanMode: 'auto' } },
  
  'd4': { id: 'd4', hubitatId: '104', name: 'Apple TV', type: DeviceType.MEDIA, roomId: 'living', state: { isOn: false, level: 30 } },
  
  // Denon AVR Mock
  'avr1': { 
      id: 'avr1', 
      hubitatId: '105', 
      name: 'Denon Receiver', 
      type: DeviceType.AVR, 
      roomId: 'living', 
      state: { 
          isOn: true, 
          level: 45, 
          mute: false,
          input: 'Satellite/Cable',
          audioMode: 'Dolby Digital'
      } 
  },

  // LG TV Mock
  'lgtv1': {
      id: 'lgtv1',
      hubitatId: '106',
      name: 'LG OLED Sala',
      type: DeviceType.TV,
      roomId: 'living',
      state: {
          isOn: true,
          level: 20,
          mute: false,
          currentApp: 'Netflix',
          transportStatus: 'playing',
          channelName: 'HDMI 1'
      }
  },

  // Blind Mock
  'b1': {
      id: 'b1',
      hubitatId: '107',
      name: 'Persiana Sala',
      type: DeviceType.BLIND,
      roomId: 'living',
      state: {
          isOn: true,
          level: 50,
          windowShade: 'partially open'
      }
  },

  // Kitchen
  'd5': { id: 'd5', hubitatId: '201', name: 'Luz Balcão', type: DeviceType.DIMMER, roomId: 'kitchen', state: { isOn: true, level: 100 } },
  'd6': { id: 'd6', hubitatId: '202', name: 'Cafeteira', type: DeviceType.SWITCH, roomId: 'kitchen', state: { isOn: false } },

  // Master
  'd7': { id: 'd7', hubitatId: '301', name: 'Spots Cabeceira', type: DeviceType.DIMMER, roomId: 'master', state: { isOn: true, level: 25 } },
  'd8': { id: 'd8', hubitatId: '302', name: 'Cortina Blackout', type: DeviceType.SWITCH, roomId: 'master', state: { isOn: false } }, 
  'd9': { id: 'd9', hubitatId: '303', name: 'Climatização', type: DeviceType.THERMOSTAT, roomId: 'master', state: { temperature: 24, setpoint: 24, mode: 'auto' } },

  // Theater
  'd10': { id: 'd10', hubitatId: '401', name: 'Projetor 4K', type: DeviceType.SWITCH, roomId: 'theater', state: { isOn: false } },
  'd11': { id: 'd11', hubitatId: '402', name: 'Luzes Indiretas', type: DeviceType.DIMMER, roomId: 'theater', state: { isOn: false, level: 10 } },

  // Security (Mocked types)
  'd12': { id: 'd12', hubitatId: '501', name: 'Câmera Sala', type: DeviceType.SWITCH, roomId: 'living', state: { isOn: true } }, 
  'd13': { id: 'd13', hubitatId: '502', name: 'Fechadura Frontal', type: DeviceType.LOCK, roomId: 'entry', state: { isLocked: true, isOn: true } },
  'd14': { id: 'd14', hubitatId: '503', name: 'Portão Garagem', type: DeviceType.LOCK, roomId: 'entry', state: { isLocked: false, isOn: false } },

  // Scenes
  's1': { id: 's1', hubitatId: '901', name: 'Jantar', type: DeviceType.SCENE, roomId: 'living', state: { activeScene: false } },
  's2': { id: 's2', hubitatId: '902', name: 'Cinema', type: DeviceType.SCENE, roomId: 'theater', state: { activeScene: false } },
  's3': { id: 's3', hubitatId: '903', name: 'Bom Dia', type: DeviceType.SCENE, roomId: 'master', state: { activeScene: false } },
  's4': { id: 's4', hubitatId: '904', name: 'Boa Noite', type: DeviceType.SCENE, roomId: 'living', state: { activeScene: false } },
  's5': { id: 's5', hubitatId: '905', name: 'Sair de Casa', type: DeviceType.SCENE, roomId: 'entry', state: { activeScene: false } },
};
