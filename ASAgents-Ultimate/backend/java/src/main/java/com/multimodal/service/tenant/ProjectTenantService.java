package com.multimodal.service.tenant;

import com.multimodal.model.Project;
import com.multimodal.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

/**
 * Example tenant-aware service wrapping ProjectRepository enforcing tenant
 * scoping.
 */
@Service
@RequiredArgsConstructor
public class ProjectTenantService extends TenantScopedService {

    private final ProjectRepository projectRepository;

    public Page<Project> listProjects(int page, int size) {
        Long tenantId = requireTenantId();
        return projectRepository.findByTenantIdOrderByCreatedAtDesc(tenantId, PageRequest.of(page, size));
    }
}
