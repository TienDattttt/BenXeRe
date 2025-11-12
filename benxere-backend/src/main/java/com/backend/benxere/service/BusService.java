package com.backend.benxere.service;

import com.backend.benxere.dto.request.BusCreationRequest;
import com.backend.benxere.dto.response.BusResponse;
import com.backend.benxere.entity.Bus;
import com.backend.benxere.entity.BusImage;
import com.backend.benxere.entity.User;
import com.backend.benxere.exception.AppException;
import com.backend.benxere.exception.ErrorCode;
import com.backend.benxere.mapper.BusMapper;
import com.backend.benxere.repository.BusImageRepository;
import com.backend.benxere.repository.BusRepository;
import com.backend.benxere.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class BusService {
    private final BusRepository busRepository;
    private final BusImageRepository busImageRepository;
    private final UserRepository userRepository;
    private final BusMapper busMapper;
    private final FileStorageService fileStorageService;

    @Autowired
    public BusService(BusRepository busRepository,
                      BusImageRepository busImageRepository,
                      UserRepository userRepository,
                      BusMapper busMapper,
                      FileStorageService fileStorageService) {
        this.busRepository = busRepository;
        this.busImageRepository = busImageRepository;
        this.userRepository = userRepository;
        this.busMapper = busMapper;
        this.fileStorageService = fileStorageService;
    }

    @Transactional
    public BusResponse createBus(BusCreationRequest request) {
        if (request.getImages() == null || request.getImages().isEmpty()) {
            throw new AppException(ErrorCode.IMAGE_NOT_FOUND);
        }

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User owner = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Bus bus = busMapper.toBus(request);
        bus.setOwner(owner);
        bus.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        bus = busRepository.save(bus);

        final Bus savedBus = bus;
        List<BusImage> images = request.getImages().stream()
                .map(image -> {
                    String imageUrl = fileStorageService.storeFile(image);
                    return BusImage.builder()
                            .bus(savedBus)
                            .imageName(image.getOriginalFilename())
                            .imageType(image.getContentType())
                            .imageUrl(imageUrl)
                            .build();
                })
                .collect(Collectors.toList());
        busImageRepository.saveAll(images);

        return busMapper.toBusResponse(bus);
    }

    public List<BusResponse> getAllBuses() {
        return busRepository.findAll().stream()
                .map(busMapper::toBusResponse)
                .collect(Collectors.toList());
    }

    public BusResponse getBusById(int id) {
        Bus bus = busRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BUS_NOT_FOUND));

        return busMapper.toBusResponse(bus);
    }

    public void deleteBus(int id) {
        busRepository.deleteById(id);
    }

    @Transactional
    public BusResponse updateBus(int id, BusCreationRequest request) {
        Bus bus = busRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BUS_NOT_FOUND));

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User owner = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        bus.setBusNumber(request.getBusNumber());
        bus.setBusType(request.getBusType());
        bus.setCapacity(request.getCapacity());
        bus.setCompanyName(request.getCompanyName());
        bus.setOwner(owner);

        final int busId = bus.getBusId();
        busImageRepository.deleteByBus_BusId(busId);

        if (request.getImages() != null) {
            Bus finalBus = bus;
            List<BusImage> images = request.getImages().stream()
                    .map(image -> {
                        String imageUrl = fileStorageService.storeFile(image);
                        return BusImage.builder()
                                .bus(finalBus)
                                .imageName(image.getOriginalFilename())
                                .imageType(image.getContentType())
                                .imageUrl(imageUrl)
                                .build();
                    })
                    .collect(Collectors.toList());
            busImageRepository.saveAll(images);
        }

        bus = busRepository.save(bus);
        return busMapper.toBusResponse(bus);
    }

    public List<BusResponse> getBusByCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User owner = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        Integer ownerId = owner.getUserId();
        return busRepository.findByOwnerUserId(ownerId).stream()
                .map(busMapper::toBusResponse)
                .collect(Collectors.toList());
    }

}